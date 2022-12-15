import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { useHistory } from 'react-router';
import DataFields from '@/components/DataFields';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import moment from 'moment';
import {
	getBackups,
	editBackupTasks,
	deleteBackups,
	getBackupTasks,
	deleteBackupTasks,
	addIncBackup,
	getIncBackup
} from '@/services/backup';
import storage from '@/utils/storage';
import { middlewareProps } from '@/pages/ServiceList/service.list';
import { statusBackupRender } from '@/utils/utils';
import { getCanReleaseMiddleware } from '@/services/middleware';
import { weekMap, backupTaskStatus } from '@/utils/const';
import { StoreState } from '@/types';
import { connect } from 'react-redux';
import { notification, Modal, Button, Switch } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import EditTime from './editTime';
import { checkLicense } from '@/services/user';
import EditIncrTime from './editIncrTime';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;

const dataType = [
	{ label: '天', value: 'day', max: 3650 },
	{ label: '周', value: 'week', max: 521 },
	{ label: '月', value: 'month', max: 120 },
	{ label: '年', value: 'year', max: 10 }
];
function BackupTaskDetail(props: any): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const history = useHistory();
	const params: any = useParams();
	const [data, setData] = useState<any>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [incrVisible, setIncrVisible] = useState<boolean>(false);
	const [modalType, setModalType] = useState<string>('');
	const [info, setInfo] = useState<any>({
		title: '基础信息',
		phrase: '',
		sourceName: '',
		position: '',
		creationTime: '',
		cron: '',
		retentionTime: '',
		dateUnit: '',
		limitRecord: '',
		endTime: ''
	});
	const [basicData, setBasicData] = useState<any>(info);
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();
	const backupDetail = storage.getLocal('backupDetail');
	const [license, setLicense] = useState<boolean>(false);
	const [infoConfig, setInfoConfig] = useState<any>([
		{
			dataIndex: 'title',
			render: (val: string) => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">{val}</div>
				</div>
			),
			span: 24
		},
		{
			dataIndex: 'phrase',
			label: '状态情况',
			render: (val: string) => statusBackupRender(val, 0, backupDetail)
		},
		{
			dataIndex: 'sourceName',
			label: '备份源名称',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{val || '/'}
				</div>
			)
		},
		{
			dataIndex: 'cron',
			label: '备份方式',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{backupDetail.schedule ? '周期' : '单次'}
					{val
						? val.indexOf('? ?') !== -1
							? `（每周${val
									.split('? ?')[1]
									.split(',')
									.map((item) => weekMap[item.trim()])}${
									Number(val.split('* *')[0].split(' ')[1]) >=
									10
										? val.split('* *')[0].split(' ')[1]
										: '0' +
										  val.split('* *')[0].split(' ')[1]
							  }:${
									Number(val.split('* *')[0].split(' ')[0]) <
									10
										? '0' +
										  val.split('* *')[0].split(' ')[0]
										: val.split('* *')[0].split(' ')[0]
							  }）`
							: `（每周${val
									.split('* *')[1]
									.split(',')
									.map((item) => weekMap[item.trim()])} ${
									Number(val.split('* *')[0].split(' ')[1]) >=
									10
										? val.split('* *')[0].split(' ')[1]
										: '0' +
										  val.split('* *')[0].split(' ')[1]
							  }:${
									val.split('* *')[0].split(' ')[0] === '0'
										? '00'
										: '30'
							  }）`
						: ''}
					{val ? (
						<EditOutlined
							style={{ marginLeft: 8, color: '#226EE7' }}
							onClick={() => {
								setVisible(true);
								setModalType('way');
							}}
						/>
					) : null}
				</div>
			)
		},
		{
			dataIndex:
				backupDetail.sourceType === 'mysql' && backupDetail.mysqlBackup
					? 'limitRecord'
					: 'retentionTime',
			label:
				backupDetail.sourceType === 'mysql' && backupDetail.mysqlBackup
					? '备份保留个数'
					: '备份保留时间',
			// dataIndex: 'retentionTime',
			// label: '备份保留时间',
			render: (val: any) => (
				<div
					className="text-overflow-one"
					title={!val || typeof val === 'number' ? val : val[0]}
				>
					{!val || typeof val === 'number' ? val : val[0]}
					{backupDetail.dateUnit && val
						? dataType.find((item) => item.value === val[1])?.label
						: ''}
					{backupDetail.schedule ? '' : '--'}
					{backupDetail.schedule ? (
						<EditOutlined
							style={{ marginLeft: 8, color: '#226EE7' }}
							onClick={() => {
								setVisible(true);
								setModalType('time');
							}}
						/>
					) : null}
				</div>
			)
		},
		{
			dataIndex: 'position',
			label: '备份位置',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{val}
				</div>
			)
		},
		{
			dataIndex: 'creationTime',
			label: '创建时间',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{val}
				</div>
			)
		}
	]);

	const increment = {
		dataIndex: 'pause',
		label: '是否开启增量',
		render: (val: string) => (
			<div className="text-overflow-one">
				{val === 'off' ? '已开启' : '未开启'}
				<Switch
					checked={val === 'off'}
					size="small"
					style={{ marginLeft: 8 }}
					onChange={(checked) => {
						if (checked) {
							setIncrVisible(true);
							setModalType('add');
						} else {
							const sendData = {
								backupName: params.backupName,
								clusterId: params.clusterId,
								namespace: params.namespace,
								type: params.type,
								time: backupDetail.time,
								cron: backupDetail.cron,
								retentionTime: backupDetail.retentionTime[0],
								dateUnit: backupDetail.dateUnit,
								turnOff: true,
								increment: true,
								pause: 'on'
							};
							editBackupTasks(sendData).then((res) => {
								getBasicInfo();
							});
						}
					}}
				/>
			</div>
		)
	};

	const time = {
		dataIndex: 'time',
		label: '备份间隔时间',
		render: (val: string) => (
			<div className="text-overflow-one">
				{(val?.substring(0, val?.length - 1) || '') + '分/次'}
				{basicData.pause === 'off' ? (
					<EditOutlined
						style={{ marginLeft: 8, color: '#226EE7' }}
						onClick={() => {
							setIncrVisible(true);
							setModalType('edit');
						}}
					/>
				) : null}
			</div>
		)
	};

	const endTime = {
		dataIndex: 'endTime',
		label: '最近一次备份时间',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val || '--'}
			</div>
		)
	};

	const getLicenseCheck = () => {
		checkLicense({ license: '', clusterId: cluster.id }).then((res) => {
			if (res.success) {
				setLicense(res.data);
			}
		});
	};

	useEffect(() => {
		getBasicInfo();
		getLicenseCheck();
	}, []);

	useEffect(() => {
		if (cluster.id !== undefined && namespace.name !== undefined) {
			getData();
			getCanReleaseMiddleware({
				clusterId: params.clusterId,
				type: params.type
			}).then((res) => {
				if (res.success) {
					setMiddlewareInfo(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [cluster.id, namespace.name]);

	useEffect(() => {
		const list = [...infoConfig];
		if (params.type === 'mysql' || params.type === 'postgresql') {
			console.log(basicData.mysqlBackup);

			if (basicData.mysqlBackup) {
				list.find((item) => item.dataIndex === 'pause') &&
					list.splice(5, 1);
			} else {
				!list.find((item) => item.dataIndex === 'pause') &&
					list.splice(5, 0, increment);
			}
			if (basicData.pause === 'off') {
				!list.find((item) => item.dataIndex === 'time') &&
					list.splice(6, 0, time);
				!list.find((item) => item.dataIndex === 'endTime') &&
					list.splice(7, 0, endTime);
			} else {
				list.find((item) => item.dataIndex === 'time') &&
					list.splice(6, 1);
				list.find((item) => item.dataIndex === 'endTime') &&
					list.splice(6, 1);
			}
			backupDetail.schedule && setInfoConfig(list);

			// basicData?.pause === 'off'
			// 	? setInfoConfig(list)
			// 	: setInfoConfig(infoConfig);
		}
	}, [basicData]);

	const getData = () => {
		getBackups({
			backupName: params.backupName,
			clusterId: params.clusterId,
			namespace: params.namespace,
			type: params.type
		}).then((res) => {
			if (res.success) {
				setData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const releaseMiddleware = () => {
		switch (backupDetail.sourceType) {
			case 'mysql':
				history.push(
					`/serviceList/mysql/MySQL/mysqlCreate/${middlewareInfo?.chartVersion}/${backupDetail.sourceName}/backup/${backupDetail.backupFileName}/${backupDetail.namespace}`
				);
				storage.setSession('menuPath', 'serviceList/mysql/MySQL');
				break;
			case 'postgresql':
				history.push(
					`/serviceList/postgresql/PostgreSQL/postgresqlCreate/${middlewareInfo?.chartVersion}/${backupDetail.sourceName}/backup/${backupDetail.namespace}`
				);
				storage.setSession(
					'menuPath',
					'serviceList/postgresql/PostgreSQL'
				);
				break;
			case 'redis':
				history.push(
					`/serviceList/redis/Redis/redisCreate/${middlewareInfo?.chartVersion}/${backupDetail.sourceName}/backup/${backupDetail.namespace}`
				);
				storage.setSession('menuPath', 'serviceList/redis/Redis');
				break;
			case 'elasticsearch':
				history.push(
					`/serviceList/elasticsearch/Elasticsearch/elasticsearchCreate/${middlewareInfo?.chartVersion}/${backupDetail.sourceName}/backup/${backupDetail.namespace}`
				);
				storage.setSession(
					'menuPath',
					'serviceList/elasticsearch/Elasticsearch'
				);
				break;
			case 'rocketmq':
				history.push(
					`/serviceList/rocketmq/rocketMQ/rocketmqCreate/${middlewareInfo?.chartVersion}/${backupDetail.sourceName}/backup/${backupDetail.namespace}`
				);
				storage.setSession('menuPath', 'serviceList/rocketmq/rocketMQ');
				break;
		}
	};

	const actionRender = (value: any, record: any, index: number) => {
		return (
			<Actions>
				<LinkButton
					disabled={index === 0}
					onClick={() => {
						Modal.confirm({
							title: '操作确认',
							content: '备份记录删除后将无法恢复，请确认执行',
							onOk: () => {
								const result = {
									clusterId: params.clusterId,
									namespace: params.namespace,
									type: record.sourceType,
									backupId: record.backupId,
									backupName: record.backupName
								};
								deleteBackups(result).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '备份记录删除成功'
										});
										getData();
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
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
	const getBasicInfo = () => {
		const sendData = {
			keyword: backupDetail.taskName,
			clusterId: params.clusterId,
			namespace: params.namespace
		};
		getBackupTasks(sendData).then((res) => {
			if (res.success) {
				getIncBackup({
					clusterId: params.clusterId,
					namespace: params.namespace,
					backupName: params.backupName
				}).then((result) => {
					if (result.success) {
						const data = {
							cron: res.data[0]?.cron,
							phrase: res.data[0]?.phrase,
							sourceName: res.data[0]?.sourceName,
							position: res.data[0]?.position,
							creationTime: res.data[0]?.creationTime,
							retentionTime: [
								res.data[0]?.retentionTime,
								res.data[0]?.dateUnit
							],
							mysqlBackup: res.data[0]?.mysqlBackup,
							dateUnit: res.data[0]?.dateUnit,
							limitRecord: res.data[0]?.limitRecord,
							endTime: result.data?.endTime,
							startTime: result.data?.startTime,
							time: result.data?.time,
							pause: result.data?.pause
						};
						setBasicData({
							title: '基础信息',
							...data
						});
						storage.setLocal('backupDetail', {
							...backupDetail,
							...data
						});
						setVisible(false);
						setIncrVisible(false);
					} else {
						notification.error({
							message: '失败',
							description: result.errorMsg
						});
					}
				});
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onCreate = (data: any) => {
		const sendData = {
			backupName: params.backupName,
			clusterId: params.clusterId,
			namespace: params.namespace,
			type: params.type,
			increment: backupDetail.increment,
			time: backupDetail.time,
			...data
		};
		if (backupDetail.mysqlBackup) {
			delete sendData.increment;
			delete sendData.time;
		}
		editBackupTasks(sendData).then((res) => {
			getBasicInfo();
		});
	};
	const onIncrCreate = (data: any) => {
		if (modalType === 'add') {
			const sendData = {
				backupName: params.backupName,
				clusterId: params.clusterId,
				namespace: params.namespace,
				increment: backupDetail.increment,
				pause: 'off',
				...data
			};
			addIncBackup(sendData).then((res) => {
				getBasicInfo();
			});
		} else {
			const sendData = {
				backupName: params.backupName,
				clusterId: params.clusterId,
				namespace: params.namespace,
				type: params.type,
				...data
			};
			editBackupTasks(sendData).then((res) => {
				getBasicInfo();
			});
		}
	};
	return (
		<ProPage>
			<ProHeader
				title={`${backupDetail.taskName}（${
					backupTaskStatus.find(
						(item) => item.value === backupDetail.phrase
					)?.text
				}）`}
				onBack={() => history.goBack()}
				extra={
					<>
						<Button
							type="primary"
							onClick={() => {
								if (!license) {
									confirm({
										title: '可用余额不足',
										content:
											'当前您的可用余额已不足2CPU，如果您想继续使用zeus中间件一体化管理平台，请联系我们申请授权',
										okText: '立即前往'
										// onOk: () => {}
									});
								} else {
									if (backupDetail.schedule) {
										history.push(
											`/backupService/backupRecovery/${
												params.clusterId || cluster.id
											}/${params.namespace}/${
												backupDetail.backupName
											}/${backupDetail.sourceType}`
										);
									} else {
										releaseMiddleware();
									}
								}
							}}
						>
							克隆服务
						</Button>
						<Button
							type="primary"
							danger
							onClick={() => {
								Modal.confirm({
									title: '操作确认',
									content: backupDetail.schedule
										? '删除周期备份任务，将清除此中间件所有备份数据且无法恢复，请确认执行？'
										: '删除单次备份任务，将清除对应备份数据且无法恢复，请确认执行？',
									onOk: () => {
										const sendData = {
											clusterId:
												backupDetail.clusterId ||
												cluster.id,
											namespace: params.namespace,
											type: backupDetail.sourceType,
											cron: backupDetail.cron || '',
											backupName: backupDetail.backupName,
											backupId: backupDetail.backupId,
											schedule: backupDetail.schedule,
											addressName:
												backupDetail.addressName,
											backupFileName:
												backupDetail.backupFileName ||
												''
										};
										deleteBackupTasks(sendData).then(
											(res) => {
												if (res.success) {
													notification.success({
														message: '成功',
														description:
															'备份任务删除成功'
													});
												} else {
													notification.error({
														message: '失败',
														description:
															res.errorMsg
													});
												}
											}
										);
										history.goBack();
									}
								});
							}}
						>
							删除任务
						</Button>
					</>
				}
			/>
			<ProContent>
				<DataFields dataSource={basicData} items={infoConfig} />
				<ProTable
					dataSource={data}
					showRefresh
					onRefresh={getData}
					rowKey="recordName"
				>
					<ProTable.Column title="备份记录" dataIndex="recordName" />
					<ProTable.Column
						title="状态"
						dataIndex="phrase"
						render={statusBackupRender}
						filterMultiple={false}
						filters={[
							backupTaskStatus[0],
							backupTaskStatus[1],
							backupTaskStatus[2]
						]}
						onFilter={(value, record: any) =>
							record.phrase === value
						}
					/>
					<ProTable.Column
						title="备份时间"
						dataIndex="creationTime"
						sorter={(a: any, b: any) =>
							moment(a.creationTime).unix() -
							moment(b.creationTime).unix()
						}
					/>
					<ProTable.Column title="操作" render={actionRender} />
				</ProTable>
				<EditTime
					data={backupDetail}
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
					type={modalType}
				/>
				<EditIncrTime
					data={backupDetail}
					visible={incrVisible}
					onCreate={onIncrCreate}
					onCancel={() => setIncrVisible(false)}
					type={modalType}
				/>
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(BackupTaskDetail);
