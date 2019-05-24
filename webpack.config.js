//const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path');

module.exports = {
  mode:"development",
  node: {
   fs: "empty"
  },
  watch: true,
  entry: {
    editor: './index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name]-bundle.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, '.'),
    compress: true,
    port: 3000
  }
}