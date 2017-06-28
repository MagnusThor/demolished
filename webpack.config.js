const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  watch: true,
  entry: './index.js',
  output: {
    filename: 'demo.js'
  },
  plugins: [
    //	new UglifyJSPlugin()
  ]
}