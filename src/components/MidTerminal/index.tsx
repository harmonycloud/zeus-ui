import React, { useEffect } from 'react';
import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { useParams } from 'react-router';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import cache from '@/utils/storage';
const TOKEN = 'token';
const action = (type: any, data?: any) => {
	const action = Object.assign(
		{
			type: type
		},
		data
	);
	return JSON.stringify(action);
};
interface ParamsProps {
	url: string;
}
interface ObjParams {
	[propsName: string]: any;
}
export default function MidTerminal(): JSX.Element {
	const params: ParamsProps = useParams();
	console.log(params);
	const { url } = params;
	const obj: ObjParams = {};
	url.split('&').map((item) => {
		const itemArr = item.split('=');
		obj[itemArr[0]] = itemArr[1];
	});
	const databaseUrl = url.replace('&source=database', '');
	const containerUrl = url.replace(
		`middlewareName=${obj.middlewareName}&middlewareType=${obj.middlewareType}&source=container&`,
		''
	);
	// 添加https和http的支持
	// wss://${window.location.hostname}:${window.location.port} 环境上使用
	let socketUrl = url.includes('&source=database')
		? databaseUrl
		: containerUrl;
	socketUrl =
		window.location.protocol.toLowerCase() === 'https:'
			? `wss://10.10.101.140:31088/ws/terminal?${socketUrl}`
			: `ws://10.10.101.140:31088/ws/terminal?${socketUrl}`;
	console.log(socketUrl);
	// socketUrl =
	// 	window.location.protocol.toLowerCase() === 'https:'
	// 		? `wss://${window.location.hostname}:${window.location.port}/ws/terminal?${socketUrl}`
	// 		: `ws://${window.location.hostname}:${window.location.port}/ws/terminal?${socketUrl}`;
	useEffect(() => {
		const socket = new WebSocket(socketUrl, cache.getLocal(TOKEN));
		const terminal = new Terminal({
			cursorStyle: 'block',
			cursorBlink: true,
			theme: {
				foreground: '#dddddd',
				cursor: 'gray'
			},
			windowsMode: true
		});
		// xterm 对websocket适用的插件，但在这里用的时候，在页面显示上有问题，就先注解了。
		// const attachAddon = new AttachAddon(socket);
		// terminal.loadAddon(attachAddon);
		// attachAddon.activate(socket);

		const fitAddon = new FitAddon();
		terminal.loadAddon(fitAddon);
		const terminalDom = document.getElementById('terminal-container');
		terminal.open(terminalDom as HTMLElement);
		fitAddon.fit();
		socket.onopen = () => {
			socket.send(action('TERMINAL_INIT'));
			socket.send(action('TERMINAL_READY'));
			socket.send(
				action('TERMINAL_RESIZE', {
					columns: fitAddon.proposeDimensions().cols,
					rows: fitAddon.proposeDimensions().rows
				})
			);
			terminal.write('Welcome to terminal! \r\n$');
		};
		socket.onclose = () => {
			terminal.write('Bye Bye! \r\n$');
		};
		socket.onerror = () => {
			terminal.write('Something errors \r\n$');
		};

		// todo 终端跟随界面重绘，不知道为什么不起作用。
		terminal.onResize(({ cols, rows }) => {
			console.log(cols, rows);
		});
		terminal.onData((e: string) => {
			socket.send(
				action('TERMINAL_COMMAND', {
					command: e
				})
			);
		});
		socket.onmessage = (e: MessageEvent<any>) => {
			console.log(e);
			const data = JSON.parse(e?.data);
			// terminal.clear();
			if (data?.type == 'TERMINAL_PRINT') {
				terminal.write(data.text);
			}
		};
		return () => {
			socket.close();
			terminal.dispose();
		};
	}, []);

	return (
		<div
			id="terminal-container"
			style={{ width: '100%', height: '100%' }}
		></div>
	);
}
