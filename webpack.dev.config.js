/* eslint-disable */

const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');

const config = {
  ...baseConfig,
  devtool: 'source-map',
};

module.exports = config;
