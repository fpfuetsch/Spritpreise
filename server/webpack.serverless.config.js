const path = require("path")
const fs = require("fs")
const Dotenv = require('dotenv-webpack');

// -- Webpack configuration --

const config = {}

// Application entry point
config.entry = "./src/lambda.js"

// We build for node
config.target = "node"

// Node module dependencies should not be bundled
config.externals = fs.readdirSync("../node_modules")
  .reduce(function(acc, mod) {
    if (mod === ".bin") {
      return acc
    }

    acc[mod] = "commonjs " + mod
    return acc
  }, {})

// We are outputting a real node app!
config.node = {
  console: false,
  global: false,
  process: false,
  Buffer: false,
  __filename: false,
  __dirname: false,
}

// Output files in the build/ folder
config.output = {
  path: path.join(__dirname, "dist/serverless"),
  filename: "bundle.js",
}

config.resolve = {
  extensions: [
    ".js",
    ".json",
  ],
}

config.module = {}

config.module.rules = [

  // Use babel and eslint to build and validate JavaScript
  {
    test: /\.js$/,
    exclude: /node_modules/,
  },

  // Allow loading of JSON files
  {
    test: /\.json$/,
    loader: "json",
  },
]

config.plugins = [
  new Dotenv()
]

module.exports = config