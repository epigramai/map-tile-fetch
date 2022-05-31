// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import * as path from 'path';
// const HtmlWebpackPlugin = require('html-webpack-plugin');
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
            // name: 'MapTileFetch',
            type: 'module',
            // export: ['TileMap', 'TileFetcher'],
            // umdNamedDefine: true,
        },
        clean: true,
    },
    externals: {
        'd3': 'd3',
        'd3-geo': 'd3-geo',
        'd3-tile': 'd3-tile',
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.html$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource'
            },
        ],
    },
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     title: "Timeline map",
        //     filename: 'index.html',
        //     template: './src/example-index-template.ejs',
        //     chunks: ['map']
        // }),
    ],
};