import './map-minimal.css';
import { TileMap } from '../../../dist/index.mjs';

console.log("MAP", TileMap)
// Example usage code
const getTile = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
let mv = new TileMap(document.body, window.innerWidth, window.innerHeight, null, getTile);
mv.render({
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {type: 'Point', coordinates: [10.7521, 59.9065]},
            properties: {},
        },
        {
            type: "Feature",
            geometry: {type: 'Point', coordinates: [10.7541, 59.9085]},
            properties: {},
        },
    ]
});
