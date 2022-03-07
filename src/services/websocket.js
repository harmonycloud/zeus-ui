import cache from '@/utils/storage';
const { wsUrl } = require('../utils/url');

const TOKEN = 'token';
const action = (type, data) => {
	let action = Object.assign(
		{
			type: type
		},
		data
	);
	return JSON.stringify(action);
};
/**
 * 参数：[socketOpen|socketClose|socketMessage|socketError] = func，[socket连接成功时触发|连接关闭|发送消息|连接错误]
 * timeout：连接超时时间
 */
export default class webSocket {
	constructor(param = {}) {
		this.param = param;
		this.reconnectCount = 0;
		this.socket = null;
		this.taskRemindInterval = null;
		this.isSucces = true;
	}

	connection = () => {
		let { socketUrl, timeout = 0 } = this.param;
		// console.log(window.location);
		let url = '';
		if (window.location.protocol.toLowerCase() === 'https:') {
			url = `${wsUrl}${socketUrl}`;

			// url = `wss://${window.location.hostname}:${window.location.port}/ws${socketUrl}`;
		} else {
			url = `${wsUrl}${socketUrl}`;

			// url = `ws://${window.location.hostname}:${window.location.port}/ws${socketUrl}`;
		}
		// 检测当前浏览器是什么浏览器来决定用什么socket
		if ('WebSocket' in window) {
			this.socket = new WebSocket(url, cache.getLocal(TOKEN));
		} else if ('MozWebSocket' in window) {
			// eslint-disable-next-line no-undef
			this.socket = new MozWebSocket(url, cache.getLocal(TOKEN));
		} else {
			// eslint-disable-next-line no-undef
			this.socket = new SockJS(url, cache.getLocal(TOKEN));
		}
		this.socket.onopen = this.onopen;
		this.socket.onmessage = this.onmessage;
		this.socket.onclose = this.onclose;
		this.socket.onerror = this.onerror;
		this.socket.sendMessage = this.sendMessage;
		// 检测返回的状态码 如果socket.readyState不等于1则连接失败，关闭连接
		if (timeout) {
			let time = setTimeout(() => {
				if (this.socket && this.socket.readyState !== 1) {
					this.socket.close();
				}
				clearInterval(time);
			}, timeout);
		}
	};

	// 连接成功触发
	onopen = () => {
		let { socketOpen } = this.param;
		this.isSucces = false; //连接成功将标识符改为false
		this.socket.send(action('TERMINAL_INIT'));
		this.socket.send(action('TERMINAL_READY'));
		socketOpen && socketOpen();
	};

	// 后端向前端推得数据
	onmessage = (msg) => {
		let { socketMessage } = this.param;
		socketMessage && socketMessage(msg);
		// 打印出后端推得数据
		// console.log(msg);
	};

	// 关闭连接触发
	onclose = (e) => {
		this.isSucces = true; //关闭将标识符改为true
		console.log('关闭socket收到的数据', e);
		let { socketClose } = this.param;
		socketClose && socketClose(e);
		this.socket.close();
		// 根据后端返回的状态码做操作，重连等
		// if (e.code == '4500') {
		// 	this.socket.close();
		// } else {
		// 	this.taskRemindInterval = setInterval(() => {
		// 		if (this.isSucces) {
		// 			this.connection();
		// 		} else {
		// 			clearInterval(this.taskRemindInterval);
		// 		}
		// 	}, 20000);
		// }
	};

	onerror = (e) => {
		// socket连接报错触发
		let { socketError } = this.param;
		this.socket = null;
		socketError && socketError(e);
	};

	sendMessage = (value) => {
		// 向后端发送数据
		if (this.socket) {
			this.socket.send(JSON.stringify(value));
		}
	};
}
