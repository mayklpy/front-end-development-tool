const path = require("path");
const fse = require("fs-extra");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const postCSSPlugins = [];

let pages = fse
  .readdirSync("./app")
  .filter(file => {
    return file.endsWith(".html");
  })
  .map(page => {
    return new HtmlWebpackPlugin({
      filename: page,
      template: `./app/${page}`
    });
  });

let config = {
  entry: "./app/assets/scripts/index.js",
  plugins: pages
};

module.exports = config;
