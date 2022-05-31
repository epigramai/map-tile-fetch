const path = require('path');
module.exports = {
    mode: 'production',
    entry: {
        index: './src/map_viz.mjs',
    },
    experiments: {
        outputModule: true
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].mjs',
        library: {
            type: 'module',
        },
        clean: true,
    },
    externals: {
        'd3': 'd3',
        'd3-geo': 'd3-geo',
        'd3-tile': 'd3-tile',
    },
};