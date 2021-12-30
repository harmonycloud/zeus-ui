import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
	Dialog,
	Icon,
	Message,
	Switch,
	Balloon,
	Button
} from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import BackupSettingForm from './backupSetting';
import messageConfig from '@/components/messageConfig';
import {
	getBackupConfig,
	addBackupConfig,
	backupNow,
	deleteBackupConfig,
	updateBackupConfig
} from '@/services/backup';
import moment from 'moment';
import transTime from '@/utils/transTime';
import storage from '@/utils/storage';

const weekMap = {
	1: '星期一',
	2: '星期二',
	3: '星期三',
	4: '星期四',
	5: '星期五',
	6: '星期六',
	0: '星期日'
};
const listMap = {
	星期一: 1,
	星期二: 2,
	星期三: 3,
	星期四: 4,
	星期五: 5,
	星期六: 6,
	星期日: 0
};

export default function Config(props) {
	const { clusterId, namespace, data: listData, dataSecurity } = props;
	const [visible, setVisible] = useState(false);
	const [backups, setBackups] = useState([]);
	const history = useHistory();
	const [keyword, setKeyword] = useState();
	const [backupData, setBackupData] = useState({
		configed: false,
		limitRecord: 0,
		cycle: '',
		time: '',
		nextBackupTime: '',
		pause: 'on',
		canPause: true
	});

	useEffect(() => {
		if (
			clusterId !== undefined &&
			namespace !== undefined &&
			listData !== undefined
		) {
			getData();
		}
	}, [listData]);

	const getData = () => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: listData.name,
			type: listData.type,
			keyword
		};
		getBackupConfig(sendData).then((res) => {
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

	const onCreate = (values) => {
		const minute = moment(values.time).get('minute');
		const hour = moment(values.time).get('hour');
		const week = values.cycle.join(',');
		const cron = `${minute} ${hour} ? ? ${week}`;

		const sendData = {
			clusterId,
			namespace,
			middlewareName: listData.name,
			type: listData.type,
			limitRecord: values.count,
			cron
		};
		if (backupData.configed) {
			addBackupConfig(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '备份设置成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					getData();
				});
		} else {
			backupNow(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '备份设置成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					getData();
				});
		}
		setVisible(false);
	};

	const backupStatusChange = (checked, record) => {
		// if (listData.type === 'elasticsearch') {
		// 	const list = [];
		// 	for (let i in listData.quota) {
		// 		list.push(listData.quota[i].storageClassName);
		// 	}
		// 	if (list.includes('local-path')) {
		// 		Message.show(
		// 			messageConfig(
		// 				'error',
		// 				'失败',
		// 				'存储类型为local-path时不支持立即备份功能'
		// 			)
		// 		);
		// 		return;
		// 	}
		// } else {
		// 	if (listData.type === 'mysql' && !listData.mysqlDTO.isLvmStorage) {
		// 		Message.show(
		// 			messageConfig(
		// 				'error',
		// 				'失败',
		// 				'存储不使用lvm时，不支持备份设置功能'
		// 			)
		// 		);
		// 		return;
		// 	}
		// 	if (
		// 		listData.quota[listData.type].storageClassName === 'local-path'
		// 	) {
		// 		Message.show(
		// 			messageConfig(
		// 				'error',
		// 				'失败',
		// 				'存储类型为local-path时不支持备份设置功能'
		// 			)
		// 		);
		// 		return;
		// 	}
		// }

		Dialog.show({
			title: '操作确认',
			content: checked
				? '请确认是否打开备份设置？'
				: '请确认是否关闭备份设置',
			onOk: () => {
				const sendData = {
					clusterId,
					namespace,
					backupScheduleName: record.backupScheduleName,
					type: listData.type,
					limitRecord: record.limitRecord,
					pause: checked ? 'off' : 'on',
					cron: record.cron
				};
				if (!record.canPause) {
					Message.show(
						messageConfig('error', '失败', '当前中间件不支持此操作')
					);
					getData();
					return;
				}
				updateBackupConfig(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								`${
									checked
										? '备份设置开启成功'
										: '备份设置关闭成功'
								}`
							)
						);
						setBackupData({
							...backupData,
							pause: checked ? 'off' : 'on'
						});
						getData();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	const onSort = (dataIndex, order) => {
		const tempDataSource = backups.sort((a, b) => {
			const result = a['createTime'] - b['createTime'];
			return order === 'asc'
				? result > 0
					? 1
					: -1
				: result > 0
				? -1
				: 1;
		});
		setBackups([...tempDataSource]);
	};

	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
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
						if (
							listData.type === 'mysql' &&
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
					}
					history.push('/disasterBackup/dataSecurity/addBackup');
					storage.setSession('detail', props);
				}}
			>
				新建
			</Button>
		)
	};

	const statusRender = (value, index, record) => {
		return (
			<Switch
				onChange={(checked) => backupStatusChange(checked, record)}
				checkedChildren="开"
				unCheckedChildren="关"
				checked={value === 'off'}
			/>
		);
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

	const sourceNameRender = (value, index, record) => {
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

	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push('/disasterBackup/dataSecurity/addBackup');
						storage.setSession('detail', {
							...props,
							record,
							isEdit: true,
							selectObj: record.sourceName
						});
					}}
				>
					编辑
				</LinkButton>
				<LinkButton
					onClick={() => {
						Dialog.show({
							title: '操作确认',
							content:
								'删除后，本地数据将被清空，无法找回，是否继续？',
							onOk: () => {
								const sendData = {
									clusterId,
									namespace,
									type: listData.type,
									backupScheduleName:
										record.backupScheduleName
								};
								// console.log(sendData);
								deleteBackupConfig(sendData)
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

	const onRefresh = () => {
		getData();
	};

	return (
		<div style={{ marginTop: 24 }}>
			<Table
				dataSource={backups}
				exact
				fixedBarExpandWidth={[24]}
				showRefresh
				onRefresh={onRefresh}
				affixActionBar
				primaryKey="key"
				operation={Operation}
				onSort={onSort}
				search={{
					placeholder: '请输入备份源名称检索',
					onSearch: onRefresh,
					onChange: (value) => setKeyword(value),
					value: keyword
				}}
				searchStyle={{
					width: '360px'
				}}
			>
				<Table.Column
					title="备份对象"
					dataIndex="backupType"
					cell={roleRender}
					width={100}
				/>
				<Table.Column
					title="备份源名称"
					dataIndex="sourceName"
					width={150}
					cell={sourceNameRender}
				/>
				<Table.Column
					title="备份保留个数"
					dataIndex="limitRecord"
					width={110}
				/>
				<Table.Column
					title="备份周期"
					dataIndex="cron"
					cell={(value) =>
						value
							.split(' ? ? ')[1]
							.split(',')
							.map((item) => weekMap[item])
							.join('、')
					}
				/>
				<Table.Column
					title="执行状态"
					dataIndex="pause"
					cell={statusRender}
					width={100}
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					sortable
					width={160}
				/>
				<Table.Column title="操作" cell={actionRender} width={100} />
			</Table>
			{/* <div className="backup-display-content">
				<div className="backup-setting">
					<div className="backup-label">备份状态</div>
					<div className="backup-value">
						<Switch
							onChange={backupStatusChange}
							checked={backupData.pause === 'off'}
						/>
						<span>
							{backupData.pause === 'off'
								? '执行备份中'
								: '备份已停止'}
						</span>
					</div>
				</div>
				<div
					className="backup-setting"
					style={{
						color:
							backupData.pause === 'off' ? '#666666' : '#9b9ea0'
					}}
				>
					<div
						className="backup-label"
						style={{
							color:
								backupData.pause === 'off'
									? '#666666'
									: '#9b9ea0'
						}}
					>
						备份保留个数{' '}
						<Balloon
							trigger={<Icon type="question-circle" size="xs" />}
							closable={false}
						>
							成功备份一次，保存一份备份文件，意味着保留最新的N份备份文件，超过数量的备份将自动删除
						</Balloon>
					</div>
					<div className="backup-value">{backupData.limitRecord}</div>
				</div>
				<div
					className="backup-setting"
					style={{
						color:
							backupData.pause === 'off' ? '#666666' : '#9b9ea0'
					}}
				>
					<div
						className="backup-label"
						style={{
							color:
								backupData.pause === 'off'
									? '#666666'
									: '#9b9ea0'
						}}
					>
						备份周期
					</div>
					<div className="backup-value">{backupData.cycle}</div>
				</div>
				<div
					className="backup-setting"
					style={{
						color:
							backupData.pause === 'off' ? '#666666' : '#9b9ea0'
					}}
				>
					<div
						className="backup-label"
						style={{
							color:
								backupData.pause === 'off'
									? '#666666'
									: '#9b9ea0'
						}}
					>
						备份时间
					</div>
					<div className="backup-value">{backupData.time}</div>
				</div>
				<div
					className="backup-setting"
					style={{
						color:
							backupData.pause === 'off' ? '#666666' : '#9b9ea0'
					}}
				>
					<div
						className="backup-label"
						style={{
							color:
								backupData.pause === 'off'
									? '#666666'
									: '#9b9ea0'
						}}
					>
						预计下次备份时间
					</div>
					<div className="backup-value">
						{transTime.gmt2local(backupData.nextBackupTime)}
					</div>
				</div>
			</div> */}
			{visible && (
				<BackupSettingForm
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
					data={backupData}
				/>
			)}
		</div>
	);
}
