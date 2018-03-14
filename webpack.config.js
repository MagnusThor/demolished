const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  node: {
   fs: "empty"
  },
  watch: true,
  entry: './demo.js',
  output: {
    filename: 'demoBundle.js'
  },
  plugins: [
    	new UglifyJSPlugin()
  ]
}
