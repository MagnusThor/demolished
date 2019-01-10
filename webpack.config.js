//const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
  mode:"development",
  node: {
   fs: "empty"
  },
  watch: true,
  entry: {
    editor: './index.js',
    player: './player.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name]-bundle.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ]
}