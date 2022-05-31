# Minimal map tile example for d3 tiles

Features:
    - made to combine with d3 visualizations on map
    - cache and preload tiles
    - minimal setup code

## Setup

To install from source:

```sh
npm install
npm run build
```

To run example:

```sh
cd examples/minimal
npm install
npm run build
```

Set up http server in dist (eg. `cd dist; python -m http.server`)

## Tile retrieval logic

Will try to retrieve cached image tiles starting with current zoom level. If any tiles are missing, then retrieve cached tiles from one level higher (more zoomed in), before retrieving first tile at lower zoom levels for any position.

If no cached tiles are found at current zoom level, cached tiles for a position are rendered in order of rising zoom level, until tile at current zoom level is downloaded and rendered on top.

After all tiles are rendered, adjacent tiles and tiles for lower zoom levels will be preloaded for a more smooth user experience.

## API

```javascript
import { TileMap } from "map-tile-fetch"
```
