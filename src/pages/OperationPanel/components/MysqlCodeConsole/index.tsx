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
import { IconFont } from '@/components/IconFont';
import {
	MysqlCodeConsoleProps,
	MysqlTableItem,
	ParamsProps
} from '../../index.d';
import { getDbTables } from '@/services/operatorPanel';
import { useParams } from 'react-router';

export default function MysqlCodeConsole(
	props: MysqlCodeConsoleProps
): JSX.Element {
	const { dbName, sql, setSql, handleExecute, isCopy } = props;
	console.log(dbName);
	const params: ParamsProps = useParams();
	const codeRef = useRef<any>(null);
	const [codeMirrorInstance, setCodeMirrorInstance] = useState<any>();
	const [dataSource, setDataSource] = useState<MysqlTableItem[]>([]);
	const completeAfter = (editor: any) => {
		const spaces = Array(editor.getOption('indentUnit')).join(';');
		editor.replaceSelection(spaces);
	};
	const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
	const [options] = useState({
		indentWithTabs: true,
		smartIndex: true,
		lineNumbers: true,
		matchBrackets: true,
		theme: 'twilight',
		extraKeys: {
			"';'": completeAfter
		},
		hintOptions: {
			completeSingle: true
		},
		lineWrapping: true,
		mode: 'text/x-sql',
		value: sql
	});
	useEffect(() => {
		init();
	}, []);
	useEffect(() => {
		if (isCopy && codeMirrorInstance) {
			codeMirrorInstance.setValue(sql);
		}
	}, [sql]);
	const init = () => {
		codeRef.current.innerHTML = '';
		const CodeMirrorInstance = CodeMirror(codeRef.current, options);
		CodeMirrorInstance.on('inputRead', (editor, change) => {
			// TODO
			// * 根据表和列的自动填充
			// console.log(dataSource);
			// const list = dataSource.map((item) => item.tableName);
			// const data = {
			// 	test: ['t_user', 'menu', 'auth_info'],
			// 	t_user: [],
			// 	menu: [''],
			// 	default: ['tableinfo']
			// };
			// console.log(list);
			CodeMirrorInstance.setOption('hintOptions', {
				tables: [],
				completeSingle: false
			});
			CodeMirrorInstance.execCommand('autocomplete');
		});
		CodeMirrorInstance.on('change', (editor, change) => {
			setSql(editor.getValue());
		});
		console.log(CodeMirrorInstance);
		setCodeMirrorInstance(CodeMirrorInstance);
	};
	const exec = () => {
		handleExecute();
	};
	return (
		<main
			className={`code-console-main ${
				isFullScreen ? 'code-console-full-screen' : ''
			}`}
		>
			<div className="code-console-action-content">
				<div>
					<Space>
						<Button size="small" type="primary" onClick={exec}>
							执行
						</Button>
						<Button
							size="small"
							onClick={() => {
								codeMirrorInstance.setValue(
									window.sqlFormatter.format(sql)
								);
								setSql(window.sqlFormatter.format(sql));
							}}
						>
							格式编排
						</Button>
						<Button
							size="small"
							onClick={() => {
								codeMirrorInstance.setValue('');
								setSql('');
							}}
						>
							清空
						</Button>
					</Space>
				</div>
				<IconFont
					type="icon-zishiyingsuofang"
					style={{
						color: '#cccccc',
						fontSize: 20,
						cursor: 'pointer'
					}}
					onClick={() => setIsFullScreen(!isFullScreen)}
				/>
			</div>
			<div id="code-console-content">
				<div ref={codeRef} style={{ width: '100%', height: '100%' }} />
			</div>
		</main>
	);
}