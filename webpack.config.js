const path = require("path");
const fse = require("fs-extra");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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

const postCSSPlugins = [
  require("autoprefixer"),
  require("cssnano")({
    safe: true,
    minifyFontValues: { removeQuotes: false }
  })
];

let cssConfig = {
  test: /\.(sa|sc|c)ss$/,
  use: [
    "css-loader?url=false",
    { loader: "sass-loader", options: { implementation: require("sass") } },
    { loader: "postcss-loader", options: { plugins: postCSSPlugins } }
  ]
};

cssConfig.use.unshift("style-loader");

let config = {
  entry: "./app/assets/scripts/index.js",
  plugins: pages,
  module: {
    rules: [cssConfig]
  },
  output: {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app")
  },
  devServer: {
    before: function(app, server) {
      server._watch("./app/**/*.html");
    },
    contentBase: path.join(__dirname, "app"),
    hot: true,
    port: 3000,
    host: "0.0.0.0"
  }
};

module.exports = config;
