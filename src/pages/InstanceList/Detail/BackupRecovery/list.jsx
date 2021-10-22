import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';
import ComponentsLoading from '@/components/componentsLoading';
import { getBackups, backupNow, deleteBackups } from '@/services/backup';
import { statusBackupRender } from '@/utils/utils';
import UseBackupForm from './useBackupForm';
import moment from 'moment';

export default function List(props) {
	const { clusterId, namespace, data: listData, storage } = props;
	const [backups, setBackups] = useState([]);
	const [backupFileName, setBackupFileName] = useState();
	const [useVisible, setUseVisible] = useState(false);
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
			const list = [];
			for (let i in listData.quota) {
				list.push(listData.quota[i].storageClassName);
			}
			if (list.includes('local-path')) {
				Message.show(
					messageConfig(
						'error',
						'失败',
						'存储类型为local-path时不支持立即备份功能'
					)
				);
				return;
			}
		} else {
			if (
				listData.quota[listData.type].storageClassName === 'local-path'
			) {
				Message.show(
					messageConfig(
						'error',
						'失败',
						'存储类型为local-path时不支持立即备份功能'
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
				backupNow(sendData)
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

	const toHandle = (backupFileName) => {
		setBackupFileName(backupFileName);
		setUseVisible(true);
	};

	// 克隆服务
	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					disabled={record.backupName === ''}
					onClick={() => toHandle(record.backupName)}
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
									middlewareName: listData.name
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
						title="备份时间"
						dataIndex="backupTime"
						width={180}
						sortable
						// cell={dateRender}
					/>
					{/* <Table.Column
						title="类型"
						dataIndex="type"
						cell={typeRender}
					/> */}
					<Table.Column
						title="状态"
						dataIndex="phrase"
						cell={statusBackupRender}
						width={150}
						sortable
					/>
					<Table.Column
						title="备份位置"
						dataIndex="backupAddressList"
						cell={addressListRender}
					/>
					<Table.Column
						title="操作"
						cell={actionRender}
						width={150}
					/>
				</Table>
			) : (
				<ComponentsLoading type="backup" clusterId={clusterId} />
			)}
			{useVisible && backupFileName !== '' && (
				<UseBackupForm
					visible={useVisible}
					onCancel={() => setUseVisible(false)}
					backupFileName={backupFileName}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={listData.name}
					type={listData.type}
				/>
			)}
		</div>
	);
}
