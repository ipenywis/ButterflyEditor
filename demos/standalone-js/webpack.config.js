"use strict";

let ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");

let path = require("path");

//Webpack Extract Text Plugin
let ExtractText = new ExtractTextWebpackPlugin("app.css");

//Mini CSS Extract Plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//Temp
const devMode = true;

let config = {
  entry: path.resolve("./app.js"),
  mode: devMode ? "development" : "production",
  output: {
    filename: "app.js",
    path: path.resolve("./dist"),
    chunkFilename: "[name].js",
    library: "opentok-ux-components",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  //devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/-ignore\.tsx?$/],
        exclude: [/-ignore\.tsx?$/],
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [/node_modules/, /-ignore\.tsx?$/]
        /*query: {
          plugins: ["transform-class-properties", "transform-decorators-legacy"]
        }*/
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/"
            }
          }
        ]
      },
      {
        test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "svgs/"
            }
          }
        ]
      }
    ]
  },

  plugins: [
    ///new WebpacBundleAnalyzer(),
    !devMode
      ? new MiniCssExtractPlugin({
          filename: devMode ? "[name].css" : "[name].[hash].css",
          chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
        })
      : ExtractText
  ]
};

//Export Config
module.exports = config;
