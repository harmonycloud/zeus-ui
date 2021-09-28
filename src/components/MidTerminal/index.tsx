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
interface MidTerminalProps {
	url: string;
}
export default function MidTerminal(props: MidTerminalProps): JSX.Element {
	// const { url } = props;
	// console.log(url);
	console.log(useParams());
	const params: MidTerminalProps = useParams();
	const socketUrl = `ws://10.1.10.13:31088/ws/terminal?${params.url}`;

	useEffect(() => {
		const socket = new WebSocket(socketUrl, cache.getLocal(TOKEN));
		const terminal = new Terminal({
			cursorStyle: 'underline',
			cursorBlink: true,
			theme: {
				foreground: '#dddddd',
				cursor: 'gray'
			},
			windowsMode: true
		});
		// const attachAddon = new AttachAddon(socket);
		// terminal.loadAddon(attachAddon);
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
		// terminal.resize = (columns: number, rows: number) => {
		// 	console.log(columns, rows);
		// 	console.log(fitAddon.proposeDimensions());
		// 	socket.send(
		// 		action('TERMINAL_RESIZE', {
		// 			columns: columns,
		// 			rows: rows
		// 		})
		// 	);
		// };
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
