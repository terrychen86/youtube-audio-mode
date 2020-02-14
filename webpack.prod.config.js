/* eslint-disable */

const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.base.config');

const config = {
  ...baseConfig,
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin()
    ],
  },
  plugins: [
    ...baseConfig.plugins,
    new CopyPlugin([
      { from: 'static', to: '' },
      { from: 'config-prod', to: '' },
    ]),
  ]
};

module.exports = config;
