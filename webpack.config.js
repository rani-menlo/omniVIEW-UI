const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[hash].js",
    publicPath: "/"
  },
  devServer: {
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "eslint-loader",
            options: {
              emitWarning: true
            }
          }
        ]
      },
      {
        test: /\.(scss|css)$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]"
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new MiniCssExtractPlugin({
      filename: "style.[hash].css"
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: "./public/index.html",
      filename: "index.html"
    })
  ],
  devtool: "inline-source-map"
};
