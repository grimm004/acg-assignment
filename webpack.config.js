const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/ts/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                include: path.resolve(__dirname, "src", "ts"),
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlPlugin({
            template: "./src/html/index.html"
        }),
        new CopyPlugin({
            patterns: [
                {from: 'assets', to: 'assets', noErrorOnMissing: true},
                {from: 'src/css', to: 'css', noErrorOnMissing: true},
            ],
        }),
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};