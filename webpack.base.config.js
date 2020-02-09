/* eslint-disable */

const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const config = {
  entry: [path.resolve(__dirname, './src/index.ts')],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['ts'],
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        loader: 'babel-loader',
        exclude: [path.join(__dirname, './node_modules')],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};

module.exports = config;
