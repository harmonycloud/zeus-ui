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
import { statusBackupRender } from '@/utils/utils';
import { backupTaskStatus } from '@/utils/const';
import storage from '@/utils/storage';
import { BackupRecordItem } from './backup';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
export default function List(props: any): JSX.Element {
	const { clusterId, namespace, data } = props;
	const params: any = useParams();
	const [disabled, setDisabled] = useState<boolean>(false);
	const [backups, setBackups] = useState<BackupRecordItem[]>([]);
	const [serviceList, setServiceList] = useState<any>([]);
	const [isLvm, setIsLvm] = useState<boolean>(true);
	const history = useHistory();

	useEffect(() => {
		if (clusterId !== undefined && namespace !== undefined) {
			getData('');
			getServiceList().then((res) => {
				res.data?.length ? setDisabled(false) : setDisabled(true);
				setServiceList(
					res.data.map((item: any) => {
						return {
							text: item.name,
							value: item.name
						};
					})
				);
			});
		}
		params.type && !data.isAllLvmStorage && setIsLvm(false);
	}, [clusterId, namespace]);

	const getData = (keyword: string) => {
		const sendData = {
			keyword,
			clusterId,
			namespace,
			middlewareName: params?.middlewareName || '',
			type: params?.type || ''
		};
		getBackupTasks(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					const data = res.data.map((item: any) => {
						if (item.status === 'Deleted' || !item.status) {
							item.index = 1;
							return item;
						} else {
							item.index = 0;
							return item;
						}
					});
					setBackups(
						data.sort(
							(a: BackupRecordItem, b: BackupRecordItem) =>
								a.index - b.index
						)
					);
				} else {
					setBackups(res.data);
				}
			} else {
				notification.error({
					message: '??????',
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
							title: '????????????',
							content: '??????????????????????????????????????????????????????',
							onOk: () => {
								const sendData = {
									clusterId,
									namespace: record.namespace,
									type: record.sourceType,
									cron: record.cron || '',
									backupName: record.backupName,
									backupId: record.backupId,
									addressName: record.addressName,
									backupFileName: record.backupFileName || ''
								};
								deleteBackupTasks(sendData)
									.then((res) => {
										if (res.success) {
											notification.success({
												message: '??????',
												description: '????????????????????????'
											});
										} else {
											notification.error({
												message: '??????',
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
					??????
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
							message: '??????',
							description: '????????????????????????????????????????????????'
						});
					} else if (!isLvm) {
						notification.error({
							message: '??????',
							description: '???????????????Lvm??????????????????????????????'
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
				??????
			</Button>
		)
	};

	const taskNameRender = (value: string, record: any, index: number) => {
		return (
			<span
				className="name-link"
				onClick={() => {
					if (record.status === 'Deleted' || !record.status) return;
					if (params.type) {
						history.push(
							`/serviceList/${params.name}/${params.aliasName}/${params.currentTab}/backupTaskDetail/${params.middlewareName}/${params.type}/${params.chartVersion}/${params.namespace}/${record.backupName}`
						);
					} else {
						history.push(
							`/backupService/backupTask/detail/${record.backupName}/${record.sourceType}`
						);
					}
					storage.setLocal('backupDetail', record);
				}}
			>
				{value}
			</span>
		);
	};

	return (
		<div>
			<ProTable
				dataSource={backups}
				showRefresh
				onRefresh={() => getData('')}
				rowKey="backupName"
				operation={Operation}
				showColumnSetting
				search={{
					placeholder: '????????????????????????',
					onSearch: (value: string) => getData(value),
					style: { width: '360px' }
				}}
				rowClassName={(record: any) =>
					record.status === 'Deleted' || !record.status
						? 'disabled'
						: ''
				}
				// onRow={(record: any) => {
				// 	return {
				// 		onClick: () => {
				// 			if (record.status === 'Deleted' || !record.status)
				// 				return;
				// 			if (params.type) {
				// 				history.push(
				// 					`/serviceList/${params.name}/${params.aliasName}/${params.currentTab}/backupTaskDetail/${params.middlewareName}/${params.type}/${params.chartVersion}/${params.namespace}/${record.backupName}`
				// 				);
				// 			} else {
				// 				history.push(
				// 					`/backupService/backupTask/detail/${record.backupName}/${record.sourceType}`
				// 				);
				// 			}
				// 			storage.setLocal('backupDetail', record);
				// 		}
				// 	};
				// }}
			>
				<ProTable.Column
					title="??????????????????"
					dataIndex="taskName"
					render={taskNameRender}
					width={160}
				/>
				{/* <ProTable.Column
							title="??????"
							dataIndex="sourceName"
							filtered
							width={150}
							render={sourceNameRender}
						/> */}
				<ProTable.Column
					title="??????"
					dataIndex="phrase"
					render={statusBackupRender}
					width={120}
					filterMultiple={false}
					filters={backupTaskStatus}
					onFilter={(value, record: any) => record.phrase === value}
				/>
				<ProTable.Column
					title="???????????????"
					dataIndex="sourceName"
					// filterMultiple={false}
					// filters={serviceList}
					// onFilter={(value, record: any) =>
					// 	record.sourceName === value
					// }
					width={160}
				/>
				<ProTable.Column
					title="????????????"
					dataIndex="backupMode"
					render={(value) =>
						value === 'single' ? '????????????' : '????????????'
					}
					width={120}
					filterMultiple={false}
					filters={[
						{ text: '????????????', value: 'period' },
						{ text: '????????????', value: 'single' }
					]}
					onFilter={(value, record: any) =>
						record.backupMode === value
					}
				/>
				<ProTable.Column title="????????????" dataIndex="position" />
				<ProTable.Column
					title="????????????"
					dataIndex="backupTime"
					width={160}
					sorter={(a: BackupRecordItem, b: BackupRecordItem) =>
						moment(a.backupTime).unix() -
						moment(b.backupTime).unix()
					}
				/>
				<ProTable.Column
					title="??????"
					render={actionRender}
					width={120}
				/>
			</ProTable>
		</div>
	);
}
