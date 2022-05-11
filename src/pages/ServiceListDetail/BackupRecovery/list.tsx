import React, { useState, useEffect } from 'react';
// import { Button, Dialog, Message, Balloon } from '@alicloud/console-components';
// import Actions, { LinkButton } from '@alicloud/console-components-actions';
// import Table from '@/components/MidTable';
// import messageConfig from '@/components/messageConfig';
import { Button, Modal, notification, Tooltip } from 'antd';
import moment from 'moment';
import { useHistory } from 'react-router';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import { getBackups, addBackupConfig, deleteBackups } from '@/services/backup';
import { statusBackupRender } from '@/utils/utils';
import { BackupRecordItem, ListProps } from '../detail';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
export default function List(props: ListProps): JSX.Element {
	const { clusterId, namespace, data: listData, storage } = props;
	const [backups, setBackups] = useState<BackupRecordItem[]>([]);
	const history = useHistory();
	useEffect(() => {
		if (
			clusterId !== undefined &&
			namespace !== undefined &&
			listData !== undefined &&
			storage?.backup
		) {
			getData();
		}
	}, [props.data]);

	const getData = () => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: listData?.name || '',
			type: listData?.type || ''
		};
		getBackups(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setBackups(
						res.data.sort(
							(a: BackupRecordItem, b: BackupRecordItem) =>
								moment(b['backupTime']).valueOf() -
								moment(a['backupTime']).valueOf()
						)
					);
				} else {
					setBackups(res.data);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const backupOnNow = () => {
		if (listData?.type === 'elasticsearch') {
			if (!listData.isAllLvmStorage) {
				notification.error({
					message: '失败',
					description: '存储不使用lvm时，不支持立即备份功能'
				});
				return;
			}
		} else {
			if (listData?.type === 'mysql' && !listData.isAllLvmStorage) {
				notification.error({
					message: '失败',
					description: '存储不使用lvm时，不支持立即备份功能'
				});
				return;
			}
		}
		confirm({
			title: '操作确认',
			content: '请确认是否立刻备份？',
			onOk: () => {
				const sendData = {
					clusterId,
					namespace,
					middlewareName: listData?.name || '',
					type: listData?.type || ''
				};
				addBackupConfig(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '备份成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};

	const actionRender = (
		value: any,
		record: BackupRecordItem,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					disabled={record.backupName === ''}
					onClick={() => {
						history.push(
							`/disasterBackup/dataSecurity/addBackup/${props?.data?.name}/${props?.data?.type}/${props.data?.chartVersion}`
						);
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
						confirm({
							title: '操作确认',
							content: '备份删除后将无法恢复，请确认执行',
							onOk: () => {
								const sendData = {
									clusterId,
									namespace,
									backupName: record.backupName,
									middlewareName: listData?.name || '',
									type: listData?.type || '',
									backupFileName: record.backupFileName
								};
								deleteBackups(sendData)
									.then((res) => {
										if (res.success) {
											notification.error({
												message: '成功',
												description: '备份删除成功'
											});
										} else {
											notification.error({
												message: '失败',
												description: res.errorMsg
											});
										}
									})
									.finally(() => {
										getData();
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
	const addressListRender = (value: string[]) => {
		if (value) {
			return (
				<Tooltip
					title={value.map((item, index) => (
						<p key={index} style={{ margin: '3px 0' }}>
							{item}
						</p>
					))}
				>
					<div
						style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							width: '250px'
						}}
					>
						{value.join(';')}
					</div>
				</Tooltip>
			);
		} else {
			return <div></div>;
		}
	};

	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'backupTime') {
			const tempDataSource = backups.sort((a, b) => {
				const result =
					moment(a['backupTime']).valueOf() -
					moment(b['backupTime']).valueOf();
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

	const roleRender = (
		value: string,
		record: BackupRecordItem,
		index: number
	) => {
		if (value === 'Cluster') {
			return '服务';
		} else {
			if (record.podRole.includes('exporter')) {
				return 'exporter';
			} else {
				if (listData?.type === 'elasticsearch') {
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

	const sourceNameRender = (
		value: string,
		record: BackupRecordItem,
		index: number
	) => {
		if (record.backupType !== 'Cluster') {
			return value;
		} else {
			return (
				<div>
					<p>{value}</p>
					<p>{record.aliasName}</p>
				</div>
			);
		}
	};

	return (
		<div style={{ marginTop: 15 }}>
			<ProTable
				dataSource={backups}
				// exact
				// fixedBarExpandWidth={[24]}
				showRefresh
				onRefresh={getData}
				// affixActionBar
				rowKey="key"
				operation={Operation}
				// onSort={onSort}
			>
				<ProTable.Column
					title="备份对象"
					dataIndex="backupType"
					width={100}
					render={roleRender}
				/>
				<ProTable.Column
					title="备份源名称"
					dataIndex="sourceName"
					width={150}
					render={sourceNameRender}
				/>
				<ProTable.Column
					title="备份位置"
					dataIndex="backupAddressList"
					render={addressListRender}
					width={250}
				/>
				<ProTable.Column
					title="备份状态"
					dataIndex="phrase"
					render={statusBackupRender}
					width={120}
					sorter={(a: BackupRecordItem) => {
						if (a['phrase'] === 'Failed') return 2;
						if (a['phrase'] === 'Running') return 1;
						if (a['phrase'] === 'Success') return -1;
						return 0;
					}}
					// sortable
				/>
				<ProTable.Column
					title="备份时间"
					dataIndex="backupTime"
					// sortable
					width={160}
					sorter={(a: BackupRecordItem, b: BackupRecordItem) =>
						moment(a.backupTime).unix() -
						moment(b.backupTime).unix()
					}
				/>
				<ProTable.Column
					title="操作"
					render={actionRender}
					width={120}
				/>
			</ProTable>
		</div>
	);
}
