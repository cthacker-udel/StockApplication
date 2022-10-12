const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	mode: "development",
	target: "node",
	entry: {
		app: ["./src/server/app.ts"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		alias: {
			server: path.resolve(__dirname, "src/server/"),
		},
		extensions: [".ts", ".js"],
	},
	output: {
		path: path.resolve(__dirname, "dist/"),
		filename: "app.js",
	},
	externals: [nodeExternals()],
};
