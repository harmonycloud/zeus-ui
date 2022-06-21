import React, { useState, useEffect } from 'react';
import { Button, Modal, notification, Tooltip } from 'antd';
import moment from 'moment';
import { useHistory, useParams } from 'react-router';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import {
	getBackupTasks,
	addBackupConfig,
	deleteBackupTasks,
	getServiceList
} from '@/services/backup';
import { statusBackupRender, nameRender } from '@/utils/utils';
import { backupTaskStatus } from '@/utils/const';
import storage from '@/utils/storage';
import { BackupRecordItem } from './backup';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
export default function List(props: any): JSX.Element {
	const { clusterId, namespace } = props;
	const params: any = useParams();
	const [disabled, setDisabled] = useState<boolean>(false);
	const [backups, setBackups] = useState<BackupRecordItem[]>([]);
	const history = useHistory();

	useEffect(() => {
		if (clusterId !== undefined && namespace !== undefined) {
			getData('');
			getServiceList().then((res) => {
				res.data?.length ? setDisabled(false) : setDisabled(true);
			});
		}
	}, [clusterId, namespace]);

	const getData = (keyword: string) => {
		const sendData = {
			keyword,
			clusterId,
			namespace,
			middlewareName: params?.name || '',
			type: params?.type || ''
		};
		getBackupTasks(sendData).then((res) => {
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

	const actionRender = (
		value: any,
		// record: BackupRecordItem,
		record: any,
		index: number
	) => {
		return (
			<Actions>
				<Button
					type="link"
					onClick={(e) => {
						e.stopPropagation();
						confirm({
							title: '操作确认',
							content: '备份删除后将无法恢复，请确认执行',
							onOk: () => {
								const sendData = {
									clusterId,
									namespace,
									type: record.sourceType,
									cron: record.cron || '',
									backupName: record.backupName,
									addressName: record.addressName,
									backupFileName: record.backupFileName || ''
								};
								console.log(sendData);

								deleteBackupTasks(sendData)
									.then((res) => {
										if (res.success) {
											notification.success({
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
										getData('');
									});
							}
						});
					}}
				>
					删除
				</Button>
			</Actions>
		);
	};

	const Operation = {
		primary: (
			<Button
				onClick={() => {
					if (disabled) {
						notification.error({
							message: '提示',
							description: '当前集群下没有服务，没有备份对象'
						});
					} else {
						if (params.type) {
							history.push(
								`/serviceList/${params.name}/${params.aliasName}/${params.currentTab}/addBackupTask/${params.middlewareName}/${params.type}/${params.chartVersion}/${params.namespace}`
							);
						} else {
							history.push(
								'/backupService/backupTask/addBackupTask'
							);
						}
					}
				}}
				type="primary"
			>
				新增
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

	return (
		<div>
			<ProTable
				dataSource={backups}
				showRefresh
				onRefresh={() => getData('')}
				rowKey="key"
				operation={Operation}
				showColumnSetting
				search={{
					placeholder: '请输入关键字搜索',
					onSearch: (value: string) => getData(value),
					style: { width: '360px' }
				}}
				onRow={(record: any) => {
					return {
						onClick: () => {
							history.push(
								`/backupService/backupTask/detail/${record.backupName}/${record.sourceType}`
							);
							storage.setLocal('backupDetail', record);
						}
					};
				}}
			>
				<ProTable.Column
					title="备份任务名称"
					dataIndex="taskName"
					render={nameRender}
					width={160}
				/>
				{/* <ProTable.Column
							title="名字"
							dataIndex="sourceName"
							filtered
							width={150}
							render={sourceNameRender}
						/> */}
				<ProTable.Column
					title="状态"
					dataIndex="phrase"
					render={statusBackupRender}
					width={120}
					filterMultiple={false}
					filters={backupTaskStatus}
					onFilter={(value, record: any) => record.phrase === value}
				/>
				<ProTable.Column
					title="备份源名称"
					dataIndex="sourceName"
					filterMultiple={false}
					filters={[{ text: '11', value: '11' }]}
					width={160}
				/>
				<ProTable.Column
					title="备份方式"
					dataIndex="phrase"
					render={() => '单次备份'}
					width={120}
					filterMultiple={false}
					filters={[
						{ text: '周期备份', value: '1' },
						{ text: '单次备份', value: '2' }
					]}
				/>
				<ProTable.Column title="备份位置" dataIndex="position" />
				<ProTable.Column
					title="备份时间"
					dataIndex="backupTime"
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
