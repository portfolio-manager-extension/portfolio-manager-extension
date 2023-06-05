const webpack = require("webpack");
const path = require("path");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    tradeRepublic: path.join(srcDir, "index.ts"),
  },
  output: {
    path: path.join(__dirname, "../../dist/js"),
    filename: "[name].js",
  },
  optimization: {},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [],
};
