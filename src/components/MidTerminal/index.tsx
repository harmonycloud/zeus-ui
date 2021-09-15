import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';
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
interface MidTerminalProps {
	url: string;
}
let term; // 终端
let socket: WebSocket; // WebSocket服务
export default function MidTerminal(props: MidTerminalProps): JSX.Element {
	const ref: any = useRef();
	const { url } = props;
	const initTerminal = () => {
		socket = new WebSocket(url, cache.getLocal(TOKEN));
		console.log(socket);
		socket.onopen = () => {
			socket.send(action('TERMINAL_INIT'));
			socket.send(action('TERMINAL_READY'));
			console.log('connection success');
		};
		socket.onerror = () => {
			console.log('连接失败');
		};
		term = new Terminal({
			cursorBlink: true
		});
		term.setOption('theme', {
			background: 'black',
			foreground: 'white'
		});
		const webLinkAddon = new WebLinksAddon();
		const fitAddon = new FitAddon();
		const attachAddon = new AttachAddon(socket);
		term.loadAddon(webLinkAddon);
		term.loadAddon(fitAddon);
		term.loadAddon(attachAddon);
		term.open((ref as MutableRefObject<HTMLDivElement>).current);
		fitAddon.fit();
		// term.prompt = () => {
		// 	term.write('\r\n');
		// };
		// term.prompt();
	};
	useEffect(() => {
		if (socket) {
			socket.close();
		}
		initTerminal();
	}, [url]);

	return <div ref={ref}></div>;
}
