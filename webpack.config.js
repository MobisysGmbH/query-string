const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'query-string': './src/query-string.ts',
    'query-string.min': './src/query-string.ts'
  },
  module: {
    rules: [
      {
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        include: /\.min\.js$/,
      })
    ]
  },
  output: {
    path: path.resolve(__dirname, 'bundle'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'QueryString',
    umdNamedDefine: false,
    globalObject: `typeof self !== 'undefined' ? self : this`
  }
}
