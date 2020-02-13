/* eslint-disable */

const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  entry: {
    app: path.resolve(__dirname, './src/page.ts'),
    chrome: path.resolve(__dirname, './src/chrome.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new CopyPlugin([
      { from: 'static', to: '' },
    ]),
  ],
};

module.exports = config;
