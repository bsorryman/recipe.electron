const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: './src/main/main.js',
    worker: './src/main/worker/worker.js',
  },
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack/main'),
  },  
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('./src/main', 'worker'),
          to: path.resolve('./.webpack/main', 'worker'),
        },
      ],
      options: {
        concurrency: 1,
      },
    }),
  ],  
};
