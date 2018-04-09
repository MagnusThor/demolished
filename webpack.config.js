//const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
  node: {
   fs: "empty"
  },
  watch: true,
  entry: {
    editor: './index.js',
    ninelives:'./ninelives.js',
    demo: './demo.js',
    lab: './lab2d.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name]-bundle.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ]
}
