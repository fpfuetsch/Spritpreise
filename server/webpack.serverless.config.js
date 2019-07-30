var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('../node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './src/lambda.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'api.js'
  },
  plugins: [
    new webpack.EnvironmentPlugin(['API_KEY', 'API_BASE_PATH', 'DB_URL'])
  ],
  externals: nodeModules
}