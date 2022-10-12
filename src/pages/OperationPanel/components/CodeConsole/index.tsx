import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/shell/shell';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/sql-hint';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';
import { Button, Space } from 'antd';
// import { format } from 'sql-formatter';
import { IconFont } from '@/components/IconFont';

export default function CodeConsole(): JSX.Element {
	const codeRef = useRef<any>(null);
	const [value, setValue] = useState('SELECT * from');
	const completeAfter = (editor: any) => {
		const spaces = Array(editor.getOption('indentUnit')).join(';');
		editor.replaceSelection(spaces);
	};
	const [options] = useState({
		indentWithTabs: true,
		smartIndex: true,
		lineNumbers: true,
		matchBrackets: true,
		theme: 'twilight',
		// autofocus: true,
		extraKeys: {
			"';'": completeAfter
		},
		hintOptions: {
			completeSingle: true
		},
		lineWrapping: true,
		mode: 'text/x-sql',
		value: value
	});
	useEffect(() => {
		init();
	}, []);
	const init = () => {
		codeRef.current.innerHTML = '';
		const CodeMirrorInstance = CodeMirror(codeRef.current, options);
		CodeMirrorInstance.on('inputRead', (editor, change) => {
			// * 根据表和列的自动填充
			const data = {
				test: ['t_user', 'menu', 'auth_info'],
				t_user: [],
				menu: [''],
				default: ['tableinfo']
			};
			CodeMirrorInstance.setOption('hintOptions', {
				tables: data,
				completeSingle: false
			});
			CodeMirrorInstance.execCommand('autocomplete');
		});
		CodeMirrorInstance.on('change', (editor, change) => {
			setValue(editor.getValue());
		});
	};
	const exec = () => {
		console.log(value);
	};
	return (
		<main className="code-console-main">
			<div className="code-console-action-content">
				<div>
					<Space>
						<Button size="small" type="primary" onClick={exec}>
							执行
						</Button>
						<Button
							size="small"
							// onClick={() => setValue((value))}
						>
							格式编排
						</Button>
						<Button size="small">清空</Button>
					</Space>
				</div>
				<IconFont
					type="icon-zishiyingsuofang"
					style={{
						color: '#cccccc',
						fontSize: 20,
						cursor: 'pointer'
					}}
				/>
			</div>
			<div id="code-console-content">
				<div ref={codeRef} style={{ width: '100%', height: '100%' }} />
			</div>
		</main>
	);
}
