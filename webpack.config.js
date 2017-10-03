//const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  node: {
   fs: "empty"
  },
  watch: true,
  entry: './index.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ]
}