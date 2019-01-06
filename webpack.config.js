"use strict";

let ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");

let path = require("path");

//Webpack Extract Text Plugin
let ExtractText = new ExtractTextWebpackPlugin("style.css");

//Webpack Analyzer
const WebpacBundleAnalyzer = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

//Add Style Components Better Debugging through plugin
const createStyledComponentsTransformer = require("typescript-plugin-styled-components")
  .default;
const styledComponentsTransformer = createStyledComponentsTransformer();

const devMode = false;

let config = {
  entry: path.resolve("./app.tsx"),
  //mode: devMode ? "development" : "production",
  output: {
    filename: "index.js",
    path: path.resolve("./dist"),
    chunkFilename: "[name].js",
    library: "opentok-ux-components",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  devtool: devMode ? "source-map" : undefined,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/-ignore\.tsx?$/],
        exclude: [/-ignore\.tsx?$/],
        loader: "awesome-typescript-loader",
        options: {
          getCustomTransformers: () => ({
            before: [styledComponentsTransformer]
          })
        }
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [/node_modules/, /-ignore\.tsx?$/],
        query: {
          presets: ["es2015", "react"],
          plugins: ["transform-class-properties", "transform-decorators-legacy"]
        }
      },
      /*{
			  enforce: "pre",
			  test: /\.js$/,
			  loader: "source-map-loader"
			},*/
      /*{
			  test: /\.scss$/,
			  use: ExtractTextWebpackPlugin.extract({
				fallback: "style-loader",
				use: ["css-loader", "sass-loader"]
			  })
			},
			{
			  test: /\.css$/,
			  use: ExtractTextWebpackPlugin.extract({
				fallback: "style-loader",
				use: ["css-loader"]
			  })
			},*/
      {
        test: /\.(sa|sc|c)ss$/,
        use: ExtractTextWebpackPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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
      /*{
			  test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
			  use: [
				{
				  loader: "file-loader",
				  options: {
					name: "[name].[ext]",
					outputPath: "svgs/",
					exclude: /icons/,
				  }
				}
			  ]
			},*/
      {
        test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "svg-inline-loader",
            options: {
              classPrefix: true
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: "ignore-loader"
      }
    ]
  },

  optimization: {
    //minimizer: !devMode ? [new UglifyJsPlugin()] : undefined
    /*splitChunks: {
		  cacheGroups: {
			commons: {
			  name: "commons",
			  chunks: "all",
			  enforce: true
			},
			vendor: {
			  test: /[\\/]node_modules[\\/]/,
			  name: "vendors",
			  chunks: "all"
			}
		  }
		}*/
  },

  /*stats: {
	  children: false
	},*/

  plugins: [
    //new WebpacBundleAnalyzer(),
    ExtractText
  ]
};

//Export Config
module.exports = config;
