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
let term: any; // 终端
let socket: WebSocket; // WebSocket服务
export default function MidTerminal(props: MidTerminalProps): JSX.Element {
	// const [terminal, setTerminal] = useState(null);
	// const prefix = 'admin $ ';
	// let inputText = ''; // 输入字符
	const ref: any = useRef();
	const { url } = props;
	console.log(url);
	const initTerminal = () => {
		socket = new WebSocket(url, cache.getLocal(TOKEN));
		socket.onopen = () => {
			socket.send(action('TERMINAL_INIT'));
			socket.send(action('TERMINAL_READY'));
			term = new Terminal({
				cursorBlink: true
			});
			term.setOption('theme', {
				background: 'black',
				foreground: 'white'
			});
			// term.writeln('connect success!');
			term.onData((str: string) => {
				console.log(str);
				socket.send(
					action('TERMINAL_COMMAND', {
						command: str
					})
				);
			});
			// term.onKey((e: any) => {
			// 	console.log(e);
			// 	// term.write(e.key);
			// 	socket.send(
			// 		action('TERMINAL_COMMAND', {
			// 			command: e.key
			// 		})
			// 	);
			// 	// const ev = e.domEvent;
			// 	// const printable =
			// 	// 	!ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;
			// 	// if (ev.keyCode === 13) {
			// 	// 	// term.prompt();
			// 	// 	// term.write(e.key);
			// 	// } else if (ev.keyCode === 8) {
			// 	// 	// Do not delete the prompt
			// 	// 	if (term._core.buffer.x > 2) {
			// 	// 		// term.write('\b \b');
			// 	// 	}
			// 	// } else if (printable) {
			// 	// 	// term.write(e.key);
			// 	// 	// socket.send(
			// 	// 	// 	action('TERMINAL_COMMAND', {
			// 	// 	// 		command: e.key
			// 	// 	// 	})
			// 	// 	// );
			// 	// }
			// });
			// const webLinkAddon = new WebLinksAddon();
			const fitAddon = new FitAddon();
			const attachAddon = new AttachAddon(socket);
			// term.loadAddon(webLinkAddon);
			term.loadAddon(fitAddon);
			term.loadAddon(attachAddon);
			term.open((ref as MutableRefObject<HTMLDivElement>).current);
			fitAddon.fit();
			term.prompt = () => {
				term.write('\r\n ');
			};
			term.prompt();
		};
		socket.onerror = () => {
			console.log('连接失败');
		};
		socket.onmessage = (msg) => {
			console.log(msg);
			if (
				msg.data !==
				'{"text":"\r\u001B[Ksh-4.2# ","type":"TERMINAL_PRINT"}'
			) {
				const data = JSON.parse(msg.data);
				console.log(data);
				// 'TERMINAL_PRINT'
				if (data.type === 'TERMINAL_PRINT') {
					console.log(data.text);
					console.log(true);
					if (data.text !== '[Ksh-4.2# ') {
						term.writeln(data.text);
					}
				}
			}
		};
	};
	useEffect(() => {
		if (socket) {
			socket.close();
		}
		initTerminal();
	}, [url]);

	return (
		<div
			// id="terminal-container"
			style={{ marginTop: 10, width: 760, height: 500 }}
			ref={ref}
		></div>
	);
}
