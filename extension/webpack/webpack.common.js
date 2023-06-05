const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    background: path.join(srcDir, "background", "index.ts"),
    app: path.join(srcDir, "ui", "app", "index.tsx"),
    popup: path.join(srcDir, "ui", "popup", "index.tsx"),
    "trade-republic-injected": path.join(srcDir, "injected", "trade-republic"),
  },
  output: {
    path: path.join(__dirname, "../../dist/js"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background" && chunk.name !== "trade-republic-injected";
      },
    },
  },
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
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "../public" }],
      options: {},
    }),
  ],
};
