import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/shell/shell';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/sql-hint';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';

export default function CodeConsole(): JSX.Element {
	const codeRef = useRef<any>(null);
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
		autofocus: true,
		extraKeys: {
			"';'": completeAfter
		},
		hintOptions: {
			completeSingle: true
		},
		lineWrapping: true,
		mode: 'text/x-sql',
		value: 'SELECT * from'
	});
	useEffect(() => {
		init();
	}, []);
	const init = () => {
		codeRef.current.innerHTML = '';
		const CodeMirrorInstance = CodeMirror(codeRef.current, options);
		CodeMirrorInstance.on('inputRead', (editor, change) => {
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
	};

	return (
		<main>
			<div></div>
			<div ref={codeRef} style={{ width: '100%', height: '100%' }} />
		</main>
	);
}
