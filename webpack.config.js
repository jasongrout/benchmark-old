var path = require('path');

module.exports = {
    entry: './lib/index.js',
    devtool: 'source-map',
    output: {
        filename: 'index.built.js',
        path: path.resolve(__dirname, 'built'),
        publicPath: 'built/'
    },
    module: {
    noParse: [
       path.resolve(__dirname, './node_modules/benchmark/benchmark.js')
    ]
    }
};
