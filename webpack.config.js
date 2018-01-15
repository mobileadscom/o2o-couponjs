const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'coupon.min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ["transform-regenerator"]
          }
        }
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [new UglifyJSPlugin()],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000
  }
}
