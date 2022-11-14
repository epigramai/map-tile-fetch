import * as d3 from 'd3';

import { TileFetcher } from './tileFetcher.mjs';

const TAU = 2 * Math.PI;

/**
 * Get tiles from a tileserver and render it on a canvas.
 * In addition a canvas is added for no particular purpose
 * @param {HTMLElement} root - HTML element to insert map into (within div#map)
 * @param {number} width - map width in pixels
 * @param {number} height - map height in pixels
 * @param {Object} [margin] - contains numbers for top, bottom, left, right in pixels
 * @param {function} [getTileUrl] - tileUrl to be passed to TileFetcher
 * @param {function} [zoomCallback] - calback on zoom event. Will return d3 zoom event object
 *
 * @property zoom - d3 zoom function
 * @property projection - d3 projection (geoMercator) with zoom transforms applied to it
 */
class TileMap {
    constructor(root, width, height, margin, getTileUrl, zoomCallback){
        this.root = root;
        this.margin = margin || {top: 0, right: 0, bottom: 0, left: 0};
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;

        this.getTileUrl = getTileUrl;
        this.projection = null;
        this.zoomCallback = zoomCallback ? zoomCallback : ()=>{};
        this.zoom = d3.zoom()
            .scaleExtent([1 << 12, 1 << 25])
            .extent([[0, 0], [this.width, this.height]])

    }
    initMap(){
        const mapDiv = d3.select(this.root).selectAll("#map")
            .data([1])
            .join(enter => enter
                .append('div')
                    .attr('id', 'map')
                    .style('position', 'relative')
                    .style('margin', `${this.margin.top}px ${this.margin.right}px ${this.margin.bottom}px ${this.margin.left}px`)
                    .style("width", `${this.width}px`)
                    .style("height", `${this.height}px`)
            )

        mapDiv
            .append('canvas')
                .attr('id', 'tile-canvas')
                .attr('width', this.width)
                .attr('height', this.height);

        mapDiv
            .append("svg")
                .attr('id', 'map-svg')
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                    .attr("id", "map-g")
                    .attr("width", this.width)
                    .attr("height", this.height)

        this.map_el = mapDiv.node();
        this.projection = d3.geoMercator();
        this.tileFetcher = new TileFetcher(
            document.querySelector('#tile-canvas').getContext('2d'),
            this.width, this.height, this.getTileUrl)

        return mapDiv;
    }

    resetMap(){
        if (this.map_el){
            this.map_el.innerHTML = "";
        }
        return this.initMap();
    }

    render(geoData){
        if (d3.select("#map").empty()) this.initMap();

        this.zoom
        .on("zoom", (ev)=>{
            this.tileFetcher.update(ev.transform);
            this.updateProjection(ev.transform);
            this.zoomCallback(ev);
        });
        const svg = d3.select("#map-svg");
        this.setInitialZoom(svg.call(this.zoom), geoData);
        svg.on("dblclick.zoom", null);
    }

    setInitialZoom(g, geoData){
        this.updateProjection({k: 1, x: 0, y:0});
        const pos = this.dataPos(geoData)
        g.call(this.zoom.transform, d3.zoomIdentity
                .translate(this.width / 2, this.height / 2)
                .scale(pos.scale)
                .translate(-pos.center[0], -pos.center[1]));
    }

    dataPos(data){
        const bounds = d3.geoPath(this.projection).bounds(data);
        let size = {
            x: bounds[1][0] - bounds[0][0],
            y: bounds[1][1] - bounds[0][1]
        };
        return {
            scale: Math.min(0.9 / Math.max(size.x / this.width, size.y / this.height), 1 << 25),
            center: [
                bounds[0][0] + 0.5 * size.x,
                bounds[0][1] + 0.5 * size.y],
        }
    }

    updateProjection(transform){
        this.projection
            .scale(transform.k / TAU)
            .translate([transform.x, transform.y])
    }
}

export {TileMap, TileFetcher};