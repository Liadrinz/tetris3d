var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/src/main.js',
    output: {
        path: __dirname + '/public/',
        filename: 'bundle.js'
    }
}