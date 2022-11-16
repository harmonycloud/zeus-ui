import React, { useState, useRef } from 'react';
import { Tabs } from 'antd';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import RedisCodeConsole from '../RedisCodeConsole';
import ExecutionTable from '../ExectionTable';
import { MysqlSqlConsoleProps, ParamsProps } from '../../index.d';
import { executeCMD } from '@/services/operatorPanel';
import ExecuteResultTypeOne from './ExecuteResultTypeOne';
import {
	CheckCircleFilled,
	CloseCircleFilled,
	ClockCircleFilled
} from '@ant-design/icons';
import ExecuteResultTypeTwo from '../MysqlSqlConsole/ExecuteResultTypeTwo';

export default function RedisSqlConsole(
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
	const [sql, setSql] = useState<string>('');
	const [isCopy, setIsCopy] = useState<boolean>(false);
	const changeSql = (values: string) => {
		setIsCopy(true);
		setSql(values);
	};
	const handleChangeSql = (values: string) => {
		setIsCopy(false);
		setSql(values);
	};
	const [items, setItems] = useState<any[]>([
		{
			label: (
				<span>
					<ClockCircleFilled style={{ color: '#226ee7' }} />
					执行记录
				</span>
			),
			children: (
				<ExecutionTable
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					database={dbName}
					changeSql={changeSql}
					refreshFlag={true}
				/>
			),
			key: '1',
			closable: false
		}
	]);
	const onChange = (key: string) => {
		setActiveKey(key);
	};
	const add = (label: any, children: any) => {
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
		// let sqlT = sql;
		// if (sqlT.charAt(sqlT.length - 1) !== ';') {
		// 	sqlT = sqlT + ';';
		// }
		// let list = sqlT.split(';');
		// console.log(list);
		// TODO 多条sql语句循环执行，筛选无效语句
		// list = list
		// 	.filter((item: string) => item !== '')
		// 	.map((item) => item + ';');
		// console.log(list);
		executeCMD({
			database: dbName,
			cmd: sql,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				// if (sqlT.includes('SELECT')) {
				// 	add(
				// 		<span>
				// 			<CheckCircleFilled style={{ color: '#52c41a' }} />
				// 			执行成功
				// 		</span>,
				// 		<ExecuteResultTypeOne resData={[]} />
				// 	);
				// }
				add(
					<span>
						<CheckCircleFilled style={{ color: '#52c41a' }} />
						执行成功
					</span>,
					<ExecuteResultTypeOne resData={res} />
				);
			} else {
				add(
					<span>
						<CloseCircleFilled style={{ color: '#ff4d4f' }} />
						执行失败
					</span>,
					<ExecuteResultTypeTwo res={res} />
				);
			}
		});
	};
	return (
		<SplitPane {...paneProps}>
			<div style={{ width: '100%' }}>
				<RedisCodeConsole
					sql={sql}
					isCopy={isCopy}
					setSql={handleChangeSql}
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
					size="small"
				/>
			</div>
		</SplitPane>
	);
}
