const { createProxyMiddleware, proxy } = require('http-proxy-middleware');
const { apiUrl, userUrl, wsUrl } = require('./utils/url');

// 配置代理后端IP
module.exports = function (app) {
	app.use(
		createProxyMiddleware('/api', {
			target: apiUrl,
			// target: 'http://10.10.136.164:8080',
			changeOrigin: true,
			pathRewrite: {
				'^/api': ''
			}
		})
	);
	app.use(
		createProxyMiddleware('/user', {
			target: userUrl,
			// target: 'http://10.10.136.9:8080',
			changeOrigin: true,
			pathRewrite: {
				'^/user': ''
			}
		})
	);
	app.use(
		createProxyMiddleware('/api/ws', {
			target: wsUrl,
			changeOrigin: true,
			ws: true
		})
	);
};
