//const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  node: {
   fs: "empty"
  },
  watch: true,
  entry: './HCHDemo.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ]
}