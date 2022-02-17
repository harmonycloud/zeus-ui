import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Dialog, Message, Switch, Button } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';
import {
	getBackupConfig,
	deleteBackupConfig,
	updateBackupConfig
} from '@/services/backup';
import moment from 'moment';
import storage from '@/utils/storage';
import { weekMap } from '@/utils/const';
import { BackupDataParams, BackupRuleItem, ConfigProps } from '../detail';

export default function Config(props: ConfigProps): JSX.Element {
	const { clusterId, namespace, data: listData } = props;
	const history = useHistory();
	const [backups, setBackups] = useState<BackupRuleItem[]>([]);
	const [keyword, setKeyword] = useState<string>();
	const [backupData, setBackupData] = useState<BackupDataParams>({
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
			middlewareName: listData?.name || '',
			type: listData?.type || '',
			keyword
		};
		getBackupConfig(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setBackups(
						res.data.sort(
							(a: BackupRuleItem, b: BackupRuleItem) =>
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

	const backupStatusChange = (checked: boolean, record: BackupRuleItem) => {
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
					type: listData?.type || '',
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

	const onSort = (dataIndex: string, order: string) => {
		const tempDataSource = backups.sort((a, b) => {
			const result =
				moment(a['createTime']).valueOf() -
				moment(b['createTime']).valueOf();
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
					if (listData?.type === 'elasticsearch') {
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
							listData?.type === 'mysql' &&
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

	const statusRender = (
		value: string,
		index: number,
		record: BackupRuleItem
	) => {
		return (
			<Switch
				onChange={(checked) => backupStatusChange(checked, record)}
				checkedChildren="开"
				unCheckedChildren="关"
				checked={value === 'off'}
			/>
		);
	};

	const roleRender = (
		value: string,
		index: number,
		record: BackupRuleItem
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
		record: BackupRuleItem
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

	const actionRender = (
		value: any,
		index: number,
		record: BackupRuleItem
	) => {
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
									type: listData?.type || '',
									backupScheduleName:
										record.backupScheduleName
								};
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

	const onRefresh = () => {
		getData();
	};

	return (
		<div style={{ marginTop: 15 }}>
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
					onChange: (value: string) => setKeyword(value),
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
					cell={(value: string) =>
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
					title="最近一次执行"
					dataIndex="createTime"
					sortable
					width={160}
				/>
				<Table.Column title="操作" cell={actionRender} width={100} />
			</Table>
		</div>
	);
}
