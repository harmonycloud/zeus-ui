// eslint-disable-next-line no-unused-vars
import React from 'react';
import axios from 'axios';
import { Message } from '@alicloud/console-components';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import errorCode from './errorCode';
import cache from '@/utils/storage';
import messageConfig from '@/components/messageConfig';

const TOKEN = 'token';

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
		if (config.method === 'GET') {
			let separator = config.url.indexOf('?') === -1 ? '?' : '&';
			config.url += `${separator}noCache=${new Date().getTime()}`;
		}
		config.headers.userToken = cache.getLocal(TOKEN);
		config.headers.authType = cache.getLocal(TOKEN) ? 1 : 0;
		return config;
	},
	(err) => {
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
		// token过期
		if (response.data.code === 401) {
			Message.show(messageConfig('error', '错误', response.data));
			cache.removeLocal('token', true);
			window.location.reload();
		}
		if (response.data.code === 404) {
			Message.show(messageConfig('error', '错误', '接口访问错误'));
		}
		return response;
	},
	(err) => {
		NProgress.done();
		if (err && err.response) {
			err.message =
				errorCode[err.response.status] || `${err.response.data.data}`;
		} else {
			err.message = '连接服务器失败!';
		}
		console.log(err.response);
		Message.show(
			messageConfig('error', '错误', err?.response?.data?.message || '')
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
				reject(err.data);
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
function _post(url, params = {}, option = {}, method = 'POST') {
	return new Promise((resolve, reject) => {
		const { restUrl, data } = restfulAPI(url, params);
		let options = {
			url: restUrl,
			data,
			method,
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded;charset=UTF-8'
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

function _put(url, params = {}, option = {}) {
	return _post(url, params, option, 'PUT');
}

/**
 * _json方法
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Object} option [请求配置]
 * @param {String} method [请求方法]
 */
function _json(url, params = {}, option = {}, method = 'POST') {
	return new Promise((resolve, reject) => {
		const { restUrl, data } = restfulAPI(url, params);
		let options = {
			url: restUrl,
			data: JSON.stringify(data),
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
