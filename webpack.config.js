const path = require('path');

module.exports = {
    watch: true,
    mode: 'production',
    entry: './s/js/index.js',
    output: {
        filename: 'index.min.js',
        path: path.resolve(__dirname, 's/js')
    }
};