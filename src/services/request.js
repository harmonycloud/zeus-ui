import React from 'react';
import axios from 'axios';
import { Message } from '@alicloud/console-components';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import errorCode from './errorCode';
import cache from '@/utils/storage';
import messageConfig from '@/components/messageConfig';

const baseURL = 'http://localhost:3000/api/';
const TOKEN = 'token';
const USERTOKEN = 'usertoken';

const pending = []; // 声明一个数组用于存储每个ajax请求的队列
const cancelToken = axios.CancelToken; // 初始化取消请求的构造函数
let arr = []; // 区分是请求还是响应的头部

const formatUrl = (url, params) => {
	const result = url;
	if (JSON.stringify(params) !== '{}') {
		for (let i in params) {
			result += `&${i}=${params[i]}`;
		}
	}
	return result;
};

const removePending = (config, f) => {
	console.log(config);
	arr = config.url.split(baseURL);
	console.log(arr);
	arr = arr[arr.length - 1];
	const restUrl = formatUrl(config.url, config.params);
	console.log(restUrl);
	// 每次请求存储在请求中队列的元素关键值,例如：一个地址为books/create的post请求处理之后为："books/create&post"
	const flagUrl = arr + '&' + config.method;
	console.log(flagUrl);
	// 当前请求存在队列中，取消第二次请求
	if (pending.indexOf(flagUrl) !== -1) {
		if (f) {
			// f为实例化的cancelToken函数
			f();
		} else {
			pending.splice(pending.indexOf(flagUrl), 1);
			// cancelToken不存在，则从队列中删除该请求
		}
	} else {
		// 当前请求不在队列中，就加进队列
		if (f) {
			pending.push(flagUrl);
		}
	}
};

// To add to window  解决promise 在ie中未定义的问题
if (!window.Promise) {
	window.Promise = Promise;
}

NProgress.configure({
	minimum: 0.1,
	easing: 'ease',
	speed: 800,
	showSpinner: false
});

// request 拦截
axios.interceptors.request.use(
	(config) => {
		NProgress.start();
		// console.log(config);
		if (config.method === 'get') {
			// config.cancelToken = new cancelToken(cancel => {
			// 	removePending(config, cancel)
			// })
			// * 添加noCache来防止缓存
			let separator = config.url.indexOf('?') === -1 ? '?' : '&';
			config.url += `${separator}noCache=${new Date().getTime()}`;
		}
		config.headers.userToken = cache.getLocal(TOKEN);
		config.headers.authType = cache.getLocal(TOKEN) ? 1 : 0;
		config.headers.projectId =
			cache.getLocal('project') &&
			cache.getLocal('project') !== 'undefined'
				? JSON.parse(cache.getLocal('project')).projectId
				: '';
		return config;
	},
	(err) => {
		console.log(err);
		NProgress.done();
		return Promise.reject(err);
	}
);

// http request 请求数据转化
const isObject = (value) => value !== null && typeof value === 'object';
axios.defaults.transformRequest = [
	function (data) {
		/**
		 * The workhorse; converts an object to x-www-form-urlencoded serialization.
		 * @param {Object} obj
		 * @return {String}
		 */
		var param = function (obj) {
			var query = '',
				name,
				value,
				fullSubName,
				subName,
				subValue,
				innerObj,
				i;

			for (name in obj) {
				value = obj[name];
				if (value instanceof Array) {
					for (i = 0; i < value.length; ++i) {
						subValue = value[i];
						fullSubName = name + '[' + i + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				} else if (value instanceof Object) {
					for (subName in value) {
						subValue = value[subName];
						var str = 'labels+[+[0-9]+]$';
						if (name.match('labels') && !name.match(str)) {
							fullSubName = name + '[' + subName + ']';
							innerObj = {};
							innerObj[fullSubName] = subValue;
							query += param(innerObj) + '&';
						} else {
							fullSubName = name + '.' + subName + '';
							innerObj = {};
							innerObj[fullSubName] = subValue;
							query += param(innerObj) + '&';
						}
					}
				} else if (value == null || value === '') {
					delete obj[name];
				} else {
					//edit hw 2015 5-11
					// else if (value !== undefined && value !== null) {
					//jshint -W116
					query +=
						encodeURIComponent(name) +
						'=' +
						encodeURIComponent(value == null ? '' : value) +
						'&';
				}
			}

			return query.length ? query.substr(0, query.length - 1) : query;
		};
		return isObject(data) &&
			String(data) !== '[object File]' &&
			String(data) !== '[object FormData]'
			? param(data)
			: data;
	}
];

// http response 拦截器
axios.interceptors.response.use(
	(response) => {
		NProgress.done();
		// if (response.config.method === 'GET') {
		// 	removePending(response.config);
		// }
		// token过期
		if (response.data.code === 401) {
			Message.show(messageConfig('error', '错误', response.data));
			cache.removeLocal('token', true);
			window.location.reload();
		}
		if (response.data.code === 404) {
			Message.show(messageConfig('error', '错误', '接口访问错误'));
		}
		response.headers.usertoken &&
			cache.setLocal('token', response.headers.usertoken);
		return response;
	},
	(err) => {
		console.log(err);
		NProgress.done();
		if (err && err.response) {
			err.message =
				errorCode[err.response.status] || `${err.response.data.data}`;
		} else {
			err.message = '连接服务器失败!';
		}
		// console.log(err.message);
		// console.log(err.response);
		Message.show(
			messageConfig(
				'error',
				'错误',
				err?.response?.data?.errorMsg || err.message
			)
		);
		return Promise.reject(err.response);
	}
);

/**
 * _get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Object} option [请求配置]
 * @param {String} method [请求方法]
 * @return {Promise}
 */
function _get(url, params = {}, option = {}, method = 'GET') {
	return new Promise((resolve, reject) => {
		const { restUrl, data } = restfulAPI(url, params);
		let options = {
			url: restUrl,
			params: data,
			method,
			...option
		};
		axios(options)
			.then((res) => {
				resolve(res.data);
			})
			.catch((err) => {
				console.log(err);
				reject(err?.data);
			});
	});
}

function _delete(url, params = {}, option = {}) {
	return _get(url, params, option, 'DELETE');
}

/**
 * _post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Object} option [请求配置]
 * @param {String} method [请求方法]
 */
function _post(
	url,
	params = {},
	option = {},
	method = 'POST',
	withParam = false
) {
	return new Promise((resolve, reject) => {
		const { restUrl, data } = restfulAPI(url, params);
		let options = {
			url: restUrl,
			data: withParam ? params : data,
			method,
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded;charset=UTF-8'
			},
			...option
		};
		console.log(options);
		axios(options)
			.then((res) => {
				resolve(res.data);
			})
			.catch((err) => {
				reject(err.data);
			});
	});
}

function _put(url, params = {}, option = {}, withParam = false) {
	return _post(url, params, option, 'PUT', withParam);
}

/**
 * _json方法
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Object} option [请求配置]
 * @param {String} method [请求方法]
 */
function _json(
	url,
	params = {},
	option = {},
	method = 'POST',
	withParam = false
) {
	return new Promise((resolve, reject) => {
		const { restUrl, data } = restfulAPI(url, params);
		let options = {
			url: restUrl,
			data: withParam ? JSON.stringify(params) : JSON.stringify(data),
			method,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8'
			},
			...option
		};
		axios(options)
			.then((res) => {
				resolve(res.data);
			})
			.catch((err) => {
				reject(err.data);
			});
	});
}

/**
 * _upload方法
 * @param {String} url [请求的url地址]
 * @param {Object} urlParams [请求时path和params的参数]
 * @param {Object} data [请求体中的参数]
 * @param {Object} option [请求配置]
 * @param {String} method [请求方法]
 */
function _upload(url, urlParams = {}, data = {}, option = {}, method = 'POST') {
	return new Promise((resolve, reject) => {
		const { restUrl, data: params } = restfulAPI(url, urlParams);
		let formData = new FormData();
		for (let key in data) {
			formData.append(key, data[key]);
		}
		let options = {
			url: restUrl,
			params: params,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			...option,
			method
		};
		axios(options)
			.then((res) => {
				resolve(res.data);
			})
			.catch((err) => {
				reject(err.data);
			});
	});
}

/**
 * _json方法
 * @param {String} url [请求的url地址]
 * @return {Boolean} method [请求方法]
 */
const isRestful = (url) => {
	return url.indexOf('{') > -1;
};

/**
 * _json方法
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Object} option [请求配置]
 * @param {String} method [请求方法]
 */
const restfulAPI = function (url, formData) {
	if (!url) throw new Error('url不能为空');
	let restfulUrl = url;
	const newFormData = Array.isArray(formData)
		? [...formData]
		: { ...formData };
	if (isRestful(url) && formData) {
		const restfulArray = url.split('/');
		restfulUrl = restfulArray
			.map((item) => {
				if (item.indexOf('{') !== -1) {
					const key = item.substring(1, item.length - 1);
					delete newFormData[key];
					return formData[key] || '';
				}
				return item;
			})
			.join('/');
	}
	return { restUrl: restfulUrl, data: newFormData };
};

export default {
	get: _get,
	delete: _delete,
	post: _post,
	put: _put,
	json: _json,
	upload: _upload,
	restfulAPI: restfulAPI
};
