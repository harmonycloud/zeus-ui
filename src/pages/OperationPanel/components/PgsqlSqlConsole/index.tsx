import { executePgsqlSql } from '@/services/operatorPanel';
import {
	CheckCircleFilled,
	ClockCircleFilled,
	CloseCircleFilled
} from '@ant-design/icons';
import { notification, Tabs } from 'antd';
import React, { useRef, useState } from 'react';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import { ParamsProps, PgsqlSqlConsoleProps } from '../../index.d';
import ExecutionTable from '../ExectionTable';
import MysqlCodeConsole from '../MysqlCodeConsole';
import ExecuteResultTypeOne from '../MysqlSqlConsole/ExecuteResultTypeOne';
import ExecuteResultTypeTwo from '../MysqlSqlConsole/ExecuteResultTypeTwo';

export default function PgsqlSqlConsole(
	props: PgsqlSqlConsoleProps
): JSX.Element {
	const { dbName } = props;
	const params: ParamsProps = useParams();
	const [activeKey, setActiveKey] = useState('1');
	const newTabIndex = useRef(0);
	const [sql, setSql] = useState<string>('SELECT * from');
	const [isCopy, setIsCopy] = useState<boolean>(false);
	const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
	const [paneProps] = useState<SplitPaneProps>({
		split: 'horizontal',
		size: '50%',
		pane2Style: {
			overflowY: 'auto'
		}
	});
	const changeSql = (values: string) => {
		setIsCopy(true);
		setSql(values);
	};
	const handleChangeSql = (values: string) => {
		setIsCopy(false);
		setSql(values);
	};
	const add = (label: any, children: any) => {
		const newActiveKey = `newTab${newTabIndex.current++}`;
		setItems([
			...items,
			{ label: label, children: children, key: newActiveKey }
		]);
		setActiveKey(newActiveKey);
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
					refreshFlag={refreshFlag}
				/>
			),
			key: '1',
			closable: false
		}
	]);
	const onChange = (key: string) => {
		setActiveKey(key);
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
			// add();
		} else {
			remove(targetKey);
		}
	};
	const handleExecute = () => {
		console.log(sql);
		executePgsqlSql({
			databaseName: dbName,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			sql: sql
		}).then((res) => {
			if (res.success) {
				console.log(res);
				if (res.data.status === 'success') {
					if (sql.includes('SELECT')) {
						const resData = {
							data: [],
							columns: []
						};
						add(
							<span>
								<CheckCircleFilled
									style={{ color: '#52c41a' }}
								/>
								执行成功
							</span>,
							<ExecuteResultTypeOne resData={resData} />
						);
					} else {
						const resTemp = {
							errorMsg: res.data.message,
							errorDetail: ''
						};
						add(
							<span>
								<CloseCircleFilled
									style={{ color: '#ff4d4f' }}
								/>
								执行失败
							</span>,
							<ExecuteResultTypeTwo res={resTemp} />
						);
					}
				} else {
					const resTemp = {
						errorMsg: res.data.message,
						errorDetail: ''
					};
					add(
						<span>
							<CloseCircleFilled style={{ color: '#ff4d4f' }} />
							执行失败
						</span>,
						<ExecuteResultTypeTwo res={resTemp} />
					);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<SplitPane {...paneProps}>
			<div style={{ width: '100%' }}>
				<MysqlCodeConsole
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
