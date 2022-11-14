import * as Tile from 'd3-tile';
// import * as d3 from 'd3';


/**
 * Get tiles from a tileserver.
 * In addition a canvas is added for no particular purpose
 * @param {CanvasRenderingContext2D} ctx - HTML Canvas context to draw on
 * @param {number} width - canvas width in pixels
 * @param {number} height - canvas height in pixels
 * @param {function} [getUrl] - tileUrl function taking tile (x,y,z) as
 *      input and returning url. Defaults to openstreetmaps tile server
 */
export class TileFetcher {
    tileSize = 256;
    nTileWidth = 2;
    getUrl = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

    constructor(ctx, width, height, getUrl){
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.tileSet = Tile.tile()
            .size([width, height]);
        this.idx = 0;
        this.tilesRemaining = 0;
        if (getUrl) this.getUrl = getUrl;
    }
    scaledTiles(tfm){
        return this.tileSet
                .scale(tfm.k)
                .translate([tfm.x, tfm.y])
                ()
    }

    update(tfm){
        this.idx += 1
        this.drawTiles(this.scaledTiles(tfm));
    }

    getImage(x, y, z){
        const img = new Image();
        img.src = this.getUrl(x, y, z);
        return img;
    }

    drawTiles(tiles){
        // this.ctx.clearRect(0, 0, this.width, this.height);
        const scale = tiles.scale;

        this.tilesRemaining = tiles.length;
        this.tileExtent = {
            min: {x: tiles[0][0], y: tiles[0][1]},
            max: {x: tiles[tiles.length-1][0], y: tiles[tiles.length-1][1]},
            z: tiles[0][2],
        }

        // Edit translation: make sure the first tile starts at an integer pixel coordinate
        const tx = Math.round(tiles.translate[0] * scale) / scale;
        const ty = Math.round(tiles.translate[1] * scale) / scale;
        // If we are on an integer zoom level, all tiles will now be pixel-aligned

        for (const [x,y,z] of tiles){
            // this.coordsRemoveMe = [x,y,z];
            const img = this.getImage(x,y,z);
            this.drawTile(img, x + tx, y + ty, scale);
            if (!img.complete){
                this.getPlaceholderTile(x, y, z, tx, ty, scale);
            }
        }
    }

    reset(){
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    getCachedImage(x, y, z) {
        let img = this.getImage(x, y, z);
        if (img.complete) return img;
        img.src = "";
        return null;
    }

    zoomedInCoordinates(x, y, z, zOffset){
        const n = Math.pow(this.nTileWidth, zOffset);

        const xNew = Math.floor(x * n);
        const yNew = Math.floor(y * n);
        return Array.from(
            {length: Math.pow(n, 2)},
            (_, i)=>[xNew + i % n, yNew + Math.floor(i / n), z + zOffset]
        );
    }

    zoomedOutCoordinates(x, y, z, zOffset){
        const n = Math.pow(this.nTileWidth, zOffset);
        const nDiv = Math.pow(this.nTileWidth, -zOffset);
        const xUpscaled = n * (x % nDiv);
        const yUpscaled = n * (y % nDiv);
        const xNew = Math.floor(x * n);
        const yNew = Math.floor(y * n);
        return {
            tile: [xNew, yNew, z + zOffset],
            offset: [xUpscaled, yUpscaled],
        }
    }

    drawHighResTiles(imgs, x, y, scale, /* tmp */){
        const hiResScale = scale / 2;
        imgs.forEach((im, i)=>{
            if (im==null) return;
            const dx = x * scale + (i % this.nTileWidth) * hiResScale;
            const dy = y * scale + Math.floor(i / this.nTileWidth) * hiResScale;
            this.ctx.drawImage(
                im,
                dx,
                dy,
                hiResScale,
                hiResScale,
            );

            // this.ctx.lineWidth = 17;
            // this.ctx.strokeStyle = 'black';
            // this.ctx.fillStyle = 'black';

            // this.ctx.strokeRect(
            //     dx,
            //     dy,
            //     hiResScale,
            //     hiResScale,)
            // this.ctx.fillText(`(${tmp[i]})`,  (dx + 0.25 * hiResScale), (dy + 0.5 * hiResScale),);
        });
    }

    getPlaceholderTile(x, y, z, tx, ty, scale){

        let hiResCoord = this.zoomedInCoordinates(x,y,z,1);
        let hiRes = hiResCoord.map(coord=>this.getCachedImage(...coord))

        if(hiRes.filter(Boolean)==hiRes.length){
            this.drawHighResTiles(hiRes, x+tx, y+ty, scale, /* hiResCoord */);
        }

        if (true || isZoomOut) {

            let img, loRes, offsetX, offsetY, zOffset;
            for(let nz=z-1; nz >=0; nz--){
                zOffset = nz - z;
                loRes = this.zoomedOutCoordinates(x, y, z, zOffset);
                img = this.getCachedImage(...loRes.tile);
                if(img){
                    offsetX = loRes.offset[0];
                    offsetY = loRes.offset[1];
                    this.ctx.drawImage(
                        img,
                        offsetX * this.tileSize,
                        offsetY * this.tileSize,
                        this.tileSize / Math.pow(this.nTileWidth, -zOffset),
                        this.tileSize / Math.pow(this.nTileWidth, -zOffset),
                        (x + tx) * scale,
                        (y + ty) * scale,
                        scale,
                        scale,
                    )
                    // this.ctx.lineWidth = 9;
                    // this.ctx.strokeStyle = 'red';
                    // this.ctx.fillStyle = 'red';

                    // this.ctx.strokeRect(
                    //     (x + tx) * scale,
                    //     (y + ty) * scale,
                    //     scale,
                    //     scale,)
                    // this.ctx.fillText(`(${loRes.tile}) [${offsetX}, ${offsetY}]`,  (x + tx + 0.25) * scale, (y + ty + 0.5) * scale,);
                    break;
                }
            }
            this.drawHighResTiles(hiRes, x+tx, y+ty, scale, /* hiResCoord */);
        }
    }

    drawTile(tileImg, x, y, scale) {
        const idx = this.idx
        const draw = () => {
            if (this.idx==idx){ // if tile is loaded too late, don't draw it.
                this.tilesRemaining -= 1
                this.ctx.drawImage(
                    tileImg,
                    x * scale,
                    y * scale,
                    scale,
                    scale
                );
                // this.ctx.lineWidth = 3;
                // this.ctx.strokeStyle = 'blue';
                // this.ctx.fillStyle = 'blue';

                // this.ctx.strokeRect(
                //     x * scale,
                //     y * scale,
                //     scale,
                //     scale,)
                // this.ctx.fillText(`(${this.coordsRemoveMe})`,  (x + 0.25) * scale, (y + 0.5) * scale,);

                if (this.tilesRemaining<=0){
                    this.prefetchImages(this.tileExtent, 2);
                }
            }

        }
        if (tileImg.complete){
            draw();
        } else {
                tileImg.onload = draw;
        }
    }

    prefetchImages(extent, bufferWidth){
        let tileCoords = new Set();
        const z = extent.z;
        for (let x=extent.min.x - bufferWidth ; x<= extent.max.x + bufferWidth; x++){
            for (let y=extent.min.y - bufferWidth; y<= extent.max.y + bufferWidth; y++){
                tileCoords.add([x, y, z])
            }
        }
        const zOffsetLarge = - Math.max(0, z - 2)
        for (let x=extent.min.x - bufferWidth ; x<= extent.max.x + bufferWidth; x+=3){
            for (let y=extent.min.y - bufferWidth; y<= extent.max.y + bufferWidth; y+=3){
                tileCoords.add(this.zoomedOutCoordinates(
                    x,y,z, zOffsetLarge
                ).tile)
            }
        }
        tileCoords.forEach(([x,y,z])=>this.getImage(x,y,z));

    }
}