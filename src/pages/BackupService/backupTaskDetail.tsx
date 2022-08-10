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
	deleteBackupTasks
} from '@/services/backup';
import storage from '@/utils/storage';
import { middlewareProps } from '@/pages/ServiceList/service.list';
import { statusBackupRender } from '@/utils/utils';
import { getCanReleaseMiddleware } from '@/services/middleware';
import { weekMap, backupTaskStatus } from '@/utils/const';
import { StoreState } from '@/types';
import { connect } from 'react-redux';
import { notification, Modal, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import EditTime from './editTime';

const LinkButton = Actions.LinkButton;

const info = {
	title: '基础信息',
	phrase: '',
	sourceName: '',
	position: '',
	backupTime: '',
	cron: '',
	retentionTime: '',
	limitRecord: '',
	x: false,
	y: ''
};
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
	const [data, setData] = useState();
	const [visible, setVisible] = useState<boolean>(false);
	const [modalType, setModalType] = useState<string>('');
	const [basicData, setBasicData] = useState<any>(info);
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();
	const backupDetail = storage.getLocal('backupDetail');
	const InfoConfig = [
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
					{backupDetail.backupMode !== 'single' ? '周期' : '单次'}
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
				backupDetail.sourceType === 'mysql'
					? 'limitRecord'
					: 'retentionTime',
			label:
				backupDetail.sourceType === 'mysql'
					? '备份保留个数'
					: '备份保留时间',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{val}
					{backupDetail.dateUnit
						? dataType.find(
								(item) => item.value === backupDetail.dateUnit
						  )?.label
						: ''}
					{backupDetail.backupMode === 'single' ? '--' : ''}
					{backupDetail.backupMode !== 'single' ? (
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
			dataIndex: 'x',
			label: '是否开启增量',
			render: (val: string) => (
				<div className="text-overflow-one">
					{val ? '已开启' : '未开启'}
				</div>
			)
		},
		{
			dataIndex: 'y',
			label: '最后一次备份时间',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{val || '--'}
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
			dataIndex: 'backupTime',
			label: '创建时间',
			render: (val: string) => (
				<div className="text-overflow-one" title={val}>
					{val}
				</div>
			)
		}
	];

	useEffect(() => {
		backupDetail &&
			setBasicData({
				title: '基础信息',
				cron: backupDetail.cron,
				phrase: backupDetail.phrase,
				sourceName: backupDetail?.sourceName,
				position: backupDetail.position,
				backupTime: backupDetail.backupTime,
				retentionTime: backupDetail.retentionTime,
				limitRecord: backupDetail.limitRecord,
				x: false,
				y: '2022-08-15 00:00:00'
			});
	}, []);

	useEffect(() => {
		if (cluster.id !== undefined && namespace.name !== undefined) {
			getData();
			getCanReleaseMiddleware({
				clusterId: cluster.id,
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

	const getData = () => {
		getBackups({
			backupName: params.backupName,
			clusterId: cluster.id,
			namespace: backupDetail.namespace,
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
					`/serviceList/postgresql/PostgreSQL/postgresqlCreate/${middlewareInfo?.chartVersion}/${backupDetail.sourceName}/backup/${backupDetail.backupFileName}/${backupDetail.namespace}`
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
					onClick={() => {
						Modal.confirm({
							title: '操作确认',
							content: '备份记录删除后将无法恢复，请确认执行',
							onOk: () => {
								const result = {
									clusterId: cluster.id,
									namespace:
										backupDetail.namespace ||
										namespace.name,
									type: record.sourceType,
									backupId: record.backupId,
									crName: record.crName,
									addressName: record.addressName
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
			clusterId: cluster.id,
			namespace: backupDetail.namespace,
			middlewareName: params?.middlewareName || '',
			type: params?.type || ''
		};
		getBackupTasks(sendData).then((res) => {
			if (res.success) {
				setBasicData({
					title: '基础信息',
					cron: res.data[0]?.cron,
					phrase: res.data[0]?.phrase,
					sourceName: res.data[0]?.sourceName,
					position: res.data[0]?.position,
					backupTime: res.data[0]?.backupTime,
					retentionTime: res.data[0]?.retentionTime,
					limitRecord: res.data[0]?.limitRecord
				});
				storage.setLocal('backupDetail', res.data[0]);
				setVisible(false);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onCreate = (cron: any) => {
		const sendData = {
			backupName: params.backupName,
			clusterId: cluster.id,
			namespace: backupDetail.namespace || namespace.name,
			type: params.type,
			...cron
		};
		editBackupTasks(sendData).then((res) => {
			getBasicInfo();
		});
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
						<Button type="primary" onClick={releaseMiddleware}>
							克隆服务
						</Button>
						<Button
							type="primary"
							danger
							onClick={() => {
								Modal.confirm({
									title: '操作确认',
									content:
										'备份任务删除后将无法恢复，请确认执行',
									onOk: () => {
										const sendData = {
											clusterId: cluster.id,
											namespace: backupDetail.namespace,
											type: backupDetail.sourceType,
											cron: backupDetail.cron || '',
											backupName: backupDetail.backupName,
											backupId: backupDetail.backupId,
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
				<DataFields dataSource={basicData} items={InfoConfig} />
				<ProTable
					dataSource={data}
					showRefresh
					onRefresh={getData}
					rowKey="recordName"
				>
					<ProTable.Column title="备份记录" dataIndex="recordName" />
					<ProTable.Column
						title="备份时间"
						dataIndex="backupTime"
						sorter={(a: any, b: any) =>
							moment(a.backupTime).unix() -
							moment(b.backupTime).unix()
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
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(BackupTaskDetail);
