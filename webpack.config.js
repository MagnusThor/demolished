const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  watch: true,
  entry: './index.js',
  output: {
    filename: 'norrland.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ]
}