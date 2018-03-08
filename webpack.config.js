//const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  node: {
   fs: "empty"
  },
  watch: true,
  entry: './index.js',
  output: {
    filename: 'demoBundle.js'
  },
  plugins: [
   // 	new UglifyJSPlugin()
  ]
}
