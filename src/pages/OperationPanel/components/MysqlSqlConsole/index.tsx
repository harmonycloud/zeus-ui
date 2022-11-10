import React, { useState, useRef } from 'react';
import { Tabs } from 'antd';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import MysqlCodeConsole from '../MysqlCodeConsole';
import ExecutionTable from '../ExectionTable';
import { MysqlSqlConsoleProps, ParamsProps } from '../../index.d';
import { executeMysqlSql } from '@/services/operatorPanel';
import ExecuteResultTypeOne from './ExecuteResultTypeOne';

export default function MysqlSqlConsole(
	props: MysqlSqlConsoleProps
): JSX.Element {
	const params: ParamsProps = useParams();
	const { dbName } = props;
	const [paneProps] = useState<SplitPaneProps>({
		split: 'horizontal',
		size: '50%',
		pane2Style: {
			overflow: 'auto'
		}
	});
	const [activeKey, setActiveKey] = useState('1');
	const newTabIndex = useRef(0);
	const [sql, setSql] = useState<string>('SELECT * from');
	const [items, setItems] = useState<any[]>([
		{
			label: '执行记录',
			children: <ExecutionTable />,
			key: '1',
			closable: false
		}
	]);
	const onChange = (key: string) => {
		setActiveKey(key);
	};
	const add = (label: string, children: any) => {
		const newActiveKey = `newTab${newTabIndex.current++}`;
		setItems([
			...items,
			{ label: label, children: children, key: newActiveKey }
		]);
		setActiveKey(newActiveKey);
	};
	const remove = (targetKey: string) => {
		const targetIndex = items.findIndex((pane) => pane.key === targetKey);
		const newPanes = items.filter((pane) => pane.key !== targetKey);
		if (newPanes.length && targetKey === activeKey) {
			const { key } =
				newPanes[
					targetIndex === newPanes.length
						? targetIndex - 1
						: targetIndex
				];
			setActiveKey(key);
		}
		setItems(newPanes);
	};
	const onEdit = (targetKey: any, action: 'add' | 'remove') => {
		if (action === 'add') {
			// TODO ?
			// add();
		} else {
			remove(targetKey);
		}
	};
	// * 执行sql语句方法
	const handleExecute = () => {
		let sqlT = sql;
		if (sqlT.substring(-1) !== ';') {
			sqlT = sqlT + ';';
		}
		let list = sqlT.split(';');
		console.log(list);
		// TODO 多条sql语句循环执行，筛选无效语句
		list = list
			.filter((item: string) => item !== '')
			.map((item) => item + ';');
		console.log(list);
		// executeMysqlSql({
		// 	database: dbName,
		// 	sql: sqlT,
		// 	clusterId: params.clusterId,
		// 	namespace: params.namespace,
		// 	middlewareName: params.name
		// }).then((res) => {
		// 	console.log(res);
		// 	if (res.success) {
		// 		if (sqlT.includes('SELECT')) {
		// 			add(
		// 				'执行结果',
		// 				<ExecuteResultTypeOne resData={res.data} />
		// 			);
		// 		}
		// 	}
		// });
	};
	return (
		<SplitPane {...paneProps}>
			<div style={{ width: '100%' }}>
				<MysqlCodeConsole
					sql={sql}
					setSql={setSql}
					dbName={dbName}
					handleExecute={handleExecute}
				/>
			</div>
			<div style={{ width: '100%', marginTop: 10 }}>
				<Tabs
					hideAdd
					onChange={onChange}
					activeKey={activeKey}
					type="editable-card"
					onEdit={onEdit}
					items={items}
				/>
			</div>
		</SplitPane>
	);
}
