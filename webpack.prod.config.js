/* eslint-disable */

const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const baseConfig = require('./webpack.base.config');

const config = {
  ...baseConfig,
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin()
    ],
  },
};

module.exports = config;
