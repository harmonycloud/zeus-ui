import React, { useState, useRef } from 'react';
import { Tabs } from 'antd';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import MysqlCodeConsole from '../MysqlCodeConsole';
import ExecutionTable from '../ExectionTable';
import { MysqlSqlConsoleProps, ParamsProps } from '../../index.d';
import { executeMysqlSql } from '@/services/operatorPanel';
import ExecuteResultTypeOne from './ExecuteResultTypeOne';
import {
	CheckCircleFilled,
	CloseCircleFilled,
	ClockCircleFilled
} from '@ant-design/icons';
import ExecuteResultTypeTwo from './ExecuteResultTypeTwo';
import { connect } from 'react-redux';
import { setRefreshFlag } from '@/redux/execute/execute';

function MysqlSqlConsole(props: MysqlSqlConsoleProps): JSX.Element {
	const params: ParamsProps = useParams();
	const { dbName, setRefreshFlag } = props;
	const [paneProps, setPaneProps] = useState<SplitPaneProps>({
		split: 'horizontal',
		size: '50%',
		pane2Style: {
			overflow: 'auto'
		}
	});
	const [activeKey, setActiveKey] = useState('1');
	const newTabIndex = useRef(0);
	const [sql, setSql] = useState<string>('SELECT * from');
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
		const itemTemp = {
			label: label,
			children: children,
			key: newActiveKey
		};
		setItems((origin) => {
			return [...origin, itemTemp];
		});
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
			// add();
		} else {
			remove(targetKey);
		}
	};
	// * 执行sql语句方法
	const handleExecute = () => {
		// * 筛选无效语句
		let sqlT = sql;
		sqlT = sqlT.replace(/\n/g, ' ');
		if (sqlT.charAt(sqlT.length - 1) !== ';') {
			sqlT = sqlT + ';';
		}
		let list = sqlT.split(';');
		list = list
			.filter((item: string) => {
				const itemTemp = item.trim();
				return itemTemp !== '';
			})
			.map((item) => item + ';');
		setRefreshFlag(true);
		list.map((item) => {
			executeMysqlSql({
				database: dbName,
				sql: item,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			}).then((res) => {
				if (res.success) {
					if (sqlT.includes('SELECT')) {
						add(
							<span>
								<CheckCircleFilled
									style={{ color: '#52c41a' }}
								/>
								执行成功
							</span>,
							<ExecuteResultTypeOne resData={res.data} />
						);
					} else {
						const resTemp = {
							title: '执行成功',
							errorMsg: res.errorMsg,
							errorDetail: res.errorDetail
						};
						add(
							<span>
								<CheckCircleFilled
									style={{ color: '#52c41a' }}
								/>
								执行成功
							</span>,
							<ExecuteResultTypeTwo res={resTemp} />
						);
					}
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
export default connect(() => ({}), {
	setRefreshFlag
})(MysqlSqlConsole);
