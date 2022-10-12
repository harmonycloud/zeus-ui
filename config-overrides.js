/* config-overrides.js */
const path = require('path');
const {
	override,
	addWebpackExternals,
	addWebpackAlias,
	overrideDevServer,
	adjustStyleLoaders,
	addWebpackResolve,
	addLessLoader,
} = require('customize-cra');

const allowCORS = () => (config) => {
	// Default config: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpackDevServer.config.js
	config.headers = { 'Access-Control-Allow-Origin': '*' };
	return config;
};

module.exports = {
	webpack: override(
		// addWebpackExternals({
		// 	React: 'React'
		// }),
		addWebpackAlias({
			'@': path.resolve(__dirname, 'src')
		}),
		// 使用less-loader对源码重的less的变量进行重新制定，设置antd自定义主题
		addLessLoader({
			lessOptions: {
				javascriptEnabled: true
				//   modifyVars: { '@primary-color': 'red' },
			},
			sourceMap: true
		}),
		adjustStyleLoaders((rule) => {
			if (rule.test.toString().includes('scss')) {
				rule.use.push({
					loader: require.resolve('sass-resources-loader'),
					options: {
						resources: [
							'./src/styles/_mixin.scss',
							// './src/styles/_color.scss',
							'./src/styles/_vars.scss'
						]
					}
				});
			}
		}),
		addWebpackResolve({
			extensions: ['.js', '.jsx', '.ts', '.tsx'] //表示这几个文件的后缀名可以省略不写
		})
	),
	devServer: overrideDevServer(allowCORS())
};
