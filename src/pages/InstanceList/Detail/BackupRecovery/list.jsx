import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';
import ComponentsLoading from '@/components/componentsLoading';
import { getBackups, addBackupConfig, deleteBackups } from '@/services/backup';
import { statusBackupRender } from '@/utils/utils';
import UseBackupForm from './useBackupForm';
import { useHistory } from 'react-router';
import moment from 'moment';

export default function List(props) {
	const {
		clusterId,
		namespace,
		data: listData,
		storage,
		dataSecurity
	} = props;
	const [backups, setBackups] = useState([]);
	const [backupData, setBackupData] = useState();
	const [useVisible, setUseVisible] = useState(false);
	const history = useHistory();
	useEffect(() => {
		if (
			clusterId !== undefined &&
			namespace !== undefined &&
			listData !== undefined &&
			storage.backup
		) {
			getData();
		}
	}, [props.data]);

	const getData = () => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: listData.name,
			type: listData.type
		};
		getBackups(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setBackups(
						res.data.sort(
							(a, b) =>
								moment(b['backupTime']).valueOf() -
								moment(a['backupTime']).valueOf()
						)
					);
				} else {
					setBackups(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const backupOnNow = () => {
		if (listData.type === 'elasticsearch') {
			if (!listData.isAllLvmStorage) {
				Message.show(
					messageConfig(
						'error',
						'失败',
						'存储不使用lvm时，不支持立即备份功能'
					)
				);
				return;
			}
		} else {
			if (listData.type === 'mysql' && !listData.isAllLvmStorage) {
				Message.show(
					messageConfig(
						'error',
						'失败',
						'存储不使用lvm时，不支持立即备份功能'
					)
				);
				return;
			}
		}
		Dialog.show({
			title: '操作确认',
			content: '请确认是否立刻备份？',
			onOk: () => {
				const sendData = {
					clusterId,
					namespace,
					middlewareName: listData.name,
					type: listData.type
				};
				addBackupConfig(sendData)
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
						getData();
					});
			}
		});
	};

	const toHandle = (backupName, backupFileName) => {
		setBackupData({ backupName, backupFileName });
		setUseVisible(true);
	};

	// 克隆服务
	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					disabled={record.backupName === ''}
					onClick={() => {
						history.push('/disasterBackup/dataSecurity/addBackup');
						sessionStorage.setItem(
							'detail',
							JSON.stringify({
								...props,
								isEdit: true,
								backup: record,
								selectObj: record.sourceName
							})
						);
					}}
				>
					使用备份
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
									backupName: record.backupName,
									middlewareName: listData.name,
									type: listData.type,
									backupFileName: record.backupFileName
								};
								// console.log(sendData);
								deleteBackups(sendData)
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
							}
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
			<Button onClick={backupOnNow} type="primary">
				立即备份
			</Button>
		)
	};
	const addressListRender = (value, index, record) => {
		if (value) {
			return (
				<div>
					{value.map((item, index) => (
						<p key={index}>{item}</p>
					))}
				</div>
			);
		} else {
			return <div></div>;
		}
	};

	const onSort = (dataIndex, order) => {
		if (dataIndex === 'backupTime') {
			const tempDataSource = backups.sort((a, b) => {
				const result = a['backupTime'] - b['backupTime'];
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setBackups([...tempDataSource]);
		} else if (dataIndex === 'phrase') {
			const tempDataSource = backups.sort((a, b) => {
				if (a['phrase'] === 'Failed') return 2;
				if (a['phrase'] === 'Running') return 1;
				if (a['phrase'] === 'Success') return -1;
				return 0;
			});
			setBackups([...tempDataSource]);
		}
	};

	const roleRender = (value, index, record) => {
		if (value === 'Cluster') {
			return '服务';
		} else {
			if (record.podRole.includes('exporter')) {
				return 'exporter';
			} else {
				if (listData.type === 'elasticsearch') {
					if (record.podRole.includes('kibana')) {
						return 'kibana';
					} else if (record.podRole.includes('client')) {
						return '协调节点';
					} else if (record.podRole.includes('master')) {
						return '主节点';
					} else if (record.podRole.includes('data')) {
						return '数据节点';
					} else if (record.podRole.includes('cold')) {
						return '冷节点';
					}
				} else {
					switch (value) {
						case 'master':
							return '主节点';
						case 'slave':
							return '从节点';
						case 'data':
							return '数据节点';
						case 'client':
							return '协调节点';
						case 'cold':
							return '冷节点';
						case 'kibana':
							return 'kibana';
						case 'nameserver':
							return 'nameserver';
						case 'exporter':
							return 'exporter';
						default:
							return '未知';
					}
				}
			}
		}
	};

	return (
		<div style={{ marginTop: 16 }}>
			{storage.backup ? (
				<Table
					dataSource={backups}
					exact
					fixedBarExpandWidth={[24]}
					showRefresh
					onRefresh={getData}
					affixActionBar
					primaryKey="key"
					operation={Operation}
					onSort={onSort}
				>
					<Table.Column
						title="备份对象"
						dataIndex="backupType"
						width={100}
						cell={roleRender}
					/>
					<Table.Column
						title="备份源名称"
						dataIndex="sourceName"
						width={150}
					/>
					<Table.Column
						title="备份位置"
						dataIndex="backupAddressList"
						cell={addressListRender}
					/>
					<Table.Column
						title="备份状态"
						dataIndex="phrase"
						cell={statusBackupRender}
						width={120}
						sortable
					/>
					<Table.Column
						title="备份时间"
						dataIndex="backupTime"
						sortable
						width={160}
					/>
					<Table.Column
						title="操作"
						cell={actionRender}
						width={120}
					/>
				</Table>
			) : (
				<ComponentsLoading type="backup" clusterId={clusterId} />
			)}
			{useVisible && backupData.backupName !== '' && (
				<UseBackupForm
					visible={useVisible}
					onCancel={() => setUseVisible(false)}
					backupData={backupData}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={listData.name}
					type={listData.type}
				/>
			)}
		</div>
	);
}
