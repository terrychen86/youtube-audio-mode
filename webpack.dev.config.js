/* eslint-disable */

const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.base.config');

const config = {
  ...baseConfig,
  devtool: 'source-map',
  plugins: [
    ...baseConfig.plugins,
    new CopyPlugin([
      { from: 'static', to: '' },
      { from: 'config-dev', to: '' },
    ]),
  ]
};

module.exports = config;
