import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Dialog, Message } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { getBackups, addBackup, deleteBackup } from '@/services/middleware';
import Table from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';
import ComponentsLoading from '@/components/componentsLoading';
import { statusBackupRender } from '@/utils/utils';
import transTime from '@/utils/transTime';

export default function List(props) {
	const {
		data: { clusterId, namespace, data: listData },
		backup
	} = props;
	const history = useHistory();
	const { middlewareName, type, chartName, chartVersion } = useParams();
	const [backups, setBackups] = useState([]);

	useEffect(() => {
		if (
			clusterId !== undefined &&
			namespace !== undefined &&
			listData !== undefined &&
			backup
		) {
			getData(clusterId, namespace, listData.name);
		}
	}, []);

	const getData = (clusterId, namespace, mysqlName) => {
		const sendData = {
			clusterId,
			namespace,
			mysqlName: mysqlName
		};
		getBackups(sendData).then((res) => {
			if (res.success) {
				setBackups(res.data);
			}
		});
	};

	const backupNow = () => {
		Dialog.show({
			title: '操作确认',
			content: '请确认是否立刻备份？',
			onOk: () => {
				const sendData = {
					clusterId,
					namespace,
					mysqlName: listData.name
				};
				addBackup(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '备份成功')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						getData(clusterId, namespace, listData.name);
					});
			},
			onCancel: () => {}
		});
	};

	const dateRender = (val) => {
		return transTime.gmt2local(val);
	};

	const typeRender = (val) => {
		switch (val) {
			case 'all':
				return '全量备份';
			default:
				return '全量备份';
		}
	};

	const toHandle = (backupFileName) => {
		if (type === 'mysql')
			history.push(
				`/serviceCatalog/mysqlCreate/${chartName}/${chartVersion}/${middlewareName}/${backupFileName}`
			);
		if (type === 'redis')
			history.push(
				`/serviceCatalog/redisCreate/${chartName}/${chartVersion}/${middlewareName}/${backupFileName}`
			);
		if (type === 'elasticsearch')
			history.push(
				`/serviceCatalog/elasticsearchCreate/${chartName}/${chartVersion}/${middlewareName}/${backupFileName}`
			);
		if (type === 'rocketmq')
			history.push(
				`/serviceCatalog/rocketmqCreate/${chartName}/${chartVersion}/${middlewareName}/${backupFileName}`
			);
	};

	// 克隆实例
	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					disabled={record.backupFileName === ''}
					onClick={() => toHandle(record.backupFileName)}
				>
					克隆实例
				</LinkButton>
				<LinkButton
					onClick={() => {
						Dialog.show({
							title: '操作确认',
							content: '备份删除后将无法恢复，请确认执行',
							onOk: () => {
								const sendData = {
									clusterId,
									namespace,
									mysqlName: listData.name,
									backupName: record.backupName,
									backupFileName: record.backupFileName
								};
								deleteBackup(sendData)
									.then((res) => {
										if (res.success) {
											Message.show(
												messageConfig(
													'success',
													'成功',
													'备份删除成功'
												)
											);
										} else {
											Message.show(
												messageConfig(
													'error',
													'失败',
													res
												)
											);
										}
									})
									.finally(() => {
										getData(
											clusterId,
											namespace,
											listData.name
										);
									});
							},
							onCancel: () => {}
						});
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const Operation = {
		primary: (
			<Button onClick={backupNow} type="primary">
				立即备份
			</Button>
		)
	};

	const onRefresh = () => {
		getData(clusterId, namespace, listData.name);
	};
	return (
		<div style={{ marginTop: 16 }}>
			{backup ? (
				<Table
					dataSource={backups}
					exact
					fixedBarExpandWidth={[24]}
					showRefresh
					onRefresh={onRefresh}
					affixActionBar
					primaryKey="key"
					operation={Operation}
				>
					<Table.Column
						title="备份时间"
						dataIndex="date"
						cell={dateRender}
					/>
					<Table.Column
						title="类型"
						dataIndex="type"
						cell={typeRender}
					/>
					<Table.Column
						title="状态"
						dataIndex="status"
						cell={statusBackupRender}
					/>
					<Table.Column title="位置" dataIndex="position" />
					<Table.Column title="操作" cell={actionRender} />
				</Table>
			) : (
				<ComponentsLoading type="backup" clusterId={clusterId} />
			)}
		</div>
	);
}
