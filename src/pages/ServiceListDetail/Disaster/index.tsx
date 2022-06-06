import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Modal, notification } from 'antd';
import {
	ReloadOutlined,
	CheckCircleFilled,
	CloseCircleFilled,
	SyncOutlined
} from '@ant-design/icons';
import DataFields from '@/components/DataFields';

import {
	DisasterOriginCard,
	DisasterBackupCardNone,
	DisasterBackupCard
} from './DisasterCard';
import moment from 'moment';

import {
	deleteMiddleware,
	switchDisasterIns,
	getMysqlExternal
} from '@/services/middleware';
import { status } from '@/utils/enum';

import './index.scss';

const clusterInfo = {
	title: '服务详情'
};
const runStateInit = {
	title: '运行状态',
	status: '',
	syncTime: ''
};
const originDataInit = {
	cluster: '',
	namespace: '',
	name: '',
	dbUser: '',
	dbPass: '',
	address: ''
};
const backupDataInit = {
	cluster: '',
	namespace: '',
	name: '',
	dbUser: '',
	dbPass: '',
	address: ''
};
interface disasterProps {
	chartName: string;
	chartVersion: string;
	middlewareName: string;
	data: any;
	clusterId: string;
	namespace: string;
	onRefresh: (key?: string) => void;
	toDetail: () => void;
	getData?: () => void;
}
interface OriginProps {
	cluster: string;
	namespace: string;
	name: string;
	dbUser: string;
	dbPass: string;
	address: string;
}
interface runStateProps {
	title: string;
	status: string;
	syncTime: string;
}

export default function Disaster(props: disasterProps): JSX.Element {
	const {
		chartName,
		chartVersion,
		middlewareName,
		data,
		clusterId,
		namespace,
		onRefresh,
		toDetail,
		getData
	} = props;
	console.log(props);
	const [originData, setOriginData] = useState<OriginProps>(originDataInit);
	const [backupData, setBackupData] = useState<OriginProps>(backupDataInit);
	const [runState, setRunState] = useState<runStateProps>(runStateInit);
	const history = useHistory();
	useEffect(() => {
		// if (clusterId && namespace && data) {
		getMysqlExternal({
			clusterId,
			namespace,
			mysqlName: middlewareName
		}).then((res) => {
			if (res.success) {
				setOriginData({
					cluster: res?.data?.source?.clusterId || '',
					namespace: res?.data?.source?.namespace || '',
					name: res?.data?.source?.middlewareName || '',
					dbUser: res?.data?.source?.username || '',
					dbPass: res?.data?.source?.password || '',
					address: res?.data?.source?.address || ''
				});
				setBackupData({
					cluster: res?.data?.disasterRecovery?.clusterId || '',
					namespace: res?.data?.disasterRecovery?.namespace || '',
					name: res?.data?.disasterRecovery?.middlewareName || '',
					dbUser: res?.data?.disasterRecovery?.username || '',
					dbPass: res?.data?.disasterRecovery?.password || '',
					address: res?.data?.disasterRecovery?.address || ''
				});
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		// }
		setRunState({
			title: '运行状态',
			status: data?.mysqlDTO?.phase || '',
			syncTime: data?.mysqlDTO?.lastUpdateTime
				? moment(data?.mysqlDTO?.lastUpdateTime).format(
						'YYYY-MM-DD HH:mm:ss'
				  )
				: '--'
		});
	}, []);
	const items: any = [
		{
			dataIndex: 'title',
			render: (val: string) => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">{val}</div>
					{data?.mysqlDTO?.canSwitch ? (
						<span
							className="name-link ml-12"
							onClick={() => {
								Modal.confirm({
									title: '操作',
									content:
										'该操作不可逆，只允许切换一次，是否继续',
									onOk: () => {
										// console.log('ok');
										const sendData = {
											clusterId: clusterId,
											namespace: namespace,
											mysqlName: middlewareName
										};
										switchDisasterIns(sendData).then(
											(res) => {
												if (res.success) {
													notification.success({
														message: '失败',
														description:
															'服务切换成功'
													});
													onRefresh();
												} else {
													notification.error({
														message: '失败',
														description:
															res.errorMsg
													});
												}
											}
										);
									}
								});
							}}
						>
							手动切换
						</span>
					) : null}
				</div>
			)
		}
	];
	const runItems: any = [
		{
			dataIndex: 'title',
			render: (val: string) => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">{val}</div>
					<ReloadOutlined
						style={{
							color: '#0070cc',
							marginLeft: 8,
							cursor: 'pointer'
						}}
						onClick={() => {
							setTimeout(() => {
								history.location.pathname ===
								'/disasterBackup/disasterCenter'
									? getData && getData()
									: onRefresh('disaster');
							}, 1000);
						}}
					/>
				</div>
			),
			span: 24
		},
		{
			dataIndex: 'status',
			label: 'MySQL同步器状态',
			render: (val: any) => {
				if (val === 'Syncing') {
					return (
						<div>
							<CheckCircleFilled
								style={{
									color: '#00A700'
								}}
							/>{' '}
							{status[val]}
						</div>
					);
				} else if (val === 'stopSyncing') {
					return (
						<div>
							<SyncOutlined
								style={{
									color: '#0091FF'
								}}
							/>{' '}
							{status[val]}
						</div>
					);
				} else {
					return (
						<div>
							<CloseCircleFilled
								style={{
									color: '#C80000'
								}}
							/>{' '}
							错误
						</div>
					);
				}
			}
		},
		{
			dataIndex: 'syncTime',
			label: '最近一次数据同步时间'
		}
	];
	const toCreateBackup: () => void = () => {
		history.push({
			pathname: `/serviceList/mysql/MySQL/mysqlCreate/disasterCreate/${chartName}/${chartVersion}/${namespace}`,
			state: { disasterOriginName: middlewareName }
		});
	};
	const deleteInstance: () => void = () => {
		Modal.confirm({
			title: '操作',
			content: '删除后数据将遗失，是否继续',
			onOk: () => {
				const sendData = {
					clusterId: backupData.cluster,
					namespace: backupData.namespace,
					middlewareName: backupData.name,
					type: chartName
				};
				deleteMiddleware(sendData).then((res) => {
					if (res) {
						notification.success({
							message: '失败',
							description: '删除成功'
						});
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
		typeof getData === 'function' ? getData() : onRefresh('disaster');
	};
	return (
		<div>
			{data?.mysqlDTO?.openDisasterRecoveryMode ? (
				<>
					<DataFields
						dataSource={runState}
						items={runItems}
						className="refresh-color"
					/>
					<div className="detail-divider"></div>
				</>
			) : null}
			<DataFields dataSource={clusterInfo} items={items} />
			<div className="disaster-card-content">
				{data?.mysqlDTO?.openDisasterRecoveryMode ? (
					<>
						<DisasterOriginCard
							originData={originData}
							toBasicInfo={() => {
								data?.mysqlDTO?.isSource
									? onRefresh('basicInfo')
									: toDetail();
							}}
						/>
						<DisasterBackupCard
							backupData={backupData}
							deleteInstance={deleteInstance}
							toDetail={() => {
								data?.mysqlDTO?.isSource
									? toDetail()
									: onRefresh('basicInfo');
							}}
						/>
					</>
				) : (
					<>
						<DisasterOriginCard
							originData={originData}
							toBasicInfo={() => {
								history.location.pathname ===
								'/disasterBackup/disasterCenter'
									? toDetail()
									: onRefresh('basicInfo');
							}}
						/>
						<DisasterBackupCardNone
							toCreateBackup={toCreateBackup}
						/>
					</>
				)}
			</div>
		</div>
	);
}
