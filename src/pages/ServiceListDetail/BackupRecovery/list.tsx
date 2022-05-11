import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message, Balloon } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';
import { getBackups, addBackupConfig, deleteBackups } from '@/services/backup';
import { statusBackupRender } from '@/utils/utils';
import { useHistory } from 'react-router';
import moment from 'moment';
import { BackupRecordItem, ListProps } from '../detail';

const { Tooltip } = Balloon;

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
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const backupOnNow = () => {
		if (
			(listData?.type === 'mysql' ||
				listData?.type === 'elasticsearch') &&
			!listData.isAllLvmStorage
		) {
			Message.show(
				messageConfig(
					'error',
					'失败',
					'存储不使用lvm时，不支持立即备份功能'
				)
			);
			return;
		}
		Dialog.show({
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

	const actionRender = (
		value: any,
		index: number,
		record: BackupRecordItem
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
						Dialog.show({
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
					trigger={
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
					}
					align="t"
				>
					{value.map((item, index) => (
						<p key={index} style={{ margin: '3px 0' }}>
							{item}
						</p>
					))}
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
		index: number,
		record: BackupRecordItem
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
		index: number,
		record: BackupRecordItem
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
					cell={sourceNameRender}
				/>
				<Table.Column
					title="备份位置"
					dataIndex="backupAddressList"
					cell={addressListRender}
					width={250}
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
				<Table.Column title="操作" cell={actionRender} width={120} />
			</Table>
		</div>
	);
}
