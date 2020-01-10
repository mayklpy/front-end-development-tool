const path = require("path");
const fse = require("fs-extra");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const currentTask = process.env.npm_lifecycle_event;

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

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy images", function() {
      fse.copySync("./app/assets/images", "./dist/assets/images");
    });
  }
}

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

let config = {
  entry: "./app/assets/scripts/index.js",
  plugins: pages,
  module: {
    rules: [cssConfig]
  }
};

if (currentTask == "dev") {
  cssConfig.use.unshift("style-loader");
  config.output = {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app")
  };
  config.devServer = {
    before: function(app, server) {
      server._watch("./app/**/*.html");
    },
    contentBase: path.join(__dirname, "app"),
    hot: true,
    port: 3000,
    host: "0.0.0.0"
  };
  config.mode = "development";
}

if (currentTask == "build") {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"]
      }
    }
  });

  cssConfig.use.unshift(MiniCssExtractPlugin.loader);

  postCSSPlugins.push(require("cssnano"));

  config.output = {
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist")
  };

  config.mode = "production";

  config.optimization = {
    splitChunks: { chunks: "all" }
  };

  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "styles.[chunkhash].css" }),
    new RunAfterCompile()
  );
}

module.exports = config;
