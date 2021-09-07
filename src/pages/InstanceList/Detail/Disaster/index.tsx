import React, { useState, useEffect } from 'react';
import DataFields, {
	IDataFieldsProps
} from '@alicloud/console-components-data-fields';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { Icon, Dialog, Message } from '@alicloud/console-components';
import {
	DisasterOriginCard,
	DisasterBackupCardNone,
	DisasterBackupCard
} from './DisasterCard';
import {
	deleteMiddleware,
	switchDisasterIns,
	getMysqlExternal
} from '@/services/middleware';
import './index.scss';
import messageConfig from '@/components/messageConfig';

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
enum status {
	Syncing = '同步中',
	stopSyncing = '停止同步',
	Error = '错误'
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
		toDetail
	} = props;
	const [originData, setOriginData] = useState<OriginProps>(originDataInit);
	const [backupData, setBackupData] = useState<OriginProps>(backupDataInit);
	const [runState, setRunState] = useState<runStateProps>(runStateInit);
	const history = useHistory();
	useEffect(() => {
		if (clusterId) {
			getMysqlExternal({
				clusterId,
				namespace,
				mysqlName: middlewareName
			}).then((res) => {
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
			});
		}
		setRunState({
			title: '运行状态',
			status: data?.mysqlDTO?.phase || '',
			syncTime: data?.mysqlDTO?.lastUpdateTime
				? moment(data?.mysqlDTO?.lastUpdateTime).format(
						'YYYY-MM-DD HH:mm:ss'
				  )
				: '--'
		});
	}, [data, namespace]);
	const items: IDataFieldsProps['items'] = [
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
								Dialog.show({
									title: '操作',
									content:
										'该操作不可逆，只允许切换一次，是否继续',
									onOk: () => {
										console.log('ok');
										const sendData = {
											clusterId: clusterId,
											namespace: namespace,
											mysqlName: middlewareName
										};
										switchDisasterIns(sendData).then(
											(res) => {
												if (res.success) {
													Message.show(
														messageConfig(
															'success',
															'成功',
															'服务切换成功'
														)
													);
													onRefresh();
												} else {
													Message.show(
														messageConfig(
															'error',
															'失败',
															res
														)
													);
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
	const runItems: IDataFieldsProps['items'] = [
		{
			dataIndex: 'title',
			render: (val: string) => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">{val}</div>
					<Icon
						type="refresh"
						size="xs"
						style={{
							color: '#0091FF',
							marginLeft: 8,
							cursor: 'pointer'
						}}
						onClick={() => {
							setTimeout(() => {
								onRefresh();
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
			render: (val) => {
				if (val === 'Syncing') {
					return (
						<>
							<Icon
								type="success1"
								size="xs"
								style={{ color: '#00A700' }}
							/>{' '}
							{status[val]}
						</>
					);
				} else if (val === 'stopSyncing') {
					return (
						<>
							<Icon
								type="sync-alt"
								size="xs"
								style={{ color: '#0091FF' }}
							/>{' '}
							{status[val]}
						</>
					);
				} else {
					return (
						<>
							<Icon
								type="warning1"
								size="xs"
								style={{ color: '#C80000' }}
							/>{' '}
							{status[val]}
						</>
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
		history.push(
			`/serviceCatalog/mysqlCreate/${chartName}/${chartVersion}/${middlewareName}`
		);
	};
	const deleteInstance: () => void = () => {
		Dialog.show({
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
						Message.show(
							messageConfig('success', '成功', '删除成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
		onRefresh();
	};
	return (
		<div>
			{data?.mysqlDTO?.openDisasterRecoveryMode ? (
				<>
					<DataFields dataSource={runState} items={runItems} />
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
							toBasicInfo={() => onRefresh('basicInfo')}
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
