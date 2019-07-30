var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/lambda.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist/serverless'),
    filename: 'api.js'
  },
  plugins: [
    new webpack.EnvironmentPlugin(['API_KEY', 'API_BASE_PATH', 'DB_URL'])
  ],
}