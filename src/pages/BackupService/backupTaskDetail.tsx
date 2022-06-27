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
	getBackupTasks
} from '@/services/backup';
import storage from '@/utils/storage';
import { middlewareProps } from '@/pages/ServiceList/service.list';
import { statusBackupRender, nullRender } from '@/utils/utils';
import { getCanReleaseMiddleware } from '@/services/middleware';
import { weekMap } from '@/utils/const';
import { StoreState } from '@/types';
import { connect } from 'react-redux';
import { notification, Modal } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import EditTime from './editTime';

const LinkButton = Actions.LinkButton;

const info = {
	title: '基础信息',
	phrase: '',
	sourceName: '',
	position: '',
	backupTime: '',
	cron: ''
};

function BackupTaskDetail(props: any): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const history = useHistory();
	const params: any = useParams();
	const [data, setData] = useState();
	const [visible, setVisible] = useState<boolean>(false);
	const [basicData, setBasicData] = useState<any>(info);
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();
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
			render: (val: string) =>
				statusBackupRender(val, 0, storage.getLocal('backupDetail'))
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
					{val ? '周期' : '单次'}
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
									val.split('* *')[0].split(' ')[0] === '0'
										? '00'
										: '30'
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
							onClick={() => setVisible(true)}
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
		storage.getLocal('backupDetail') &&
			setBasicData({
				title: '基础信息',
				cron: storage.getLocal('backupDetail').cron,
				phrase: storage.getLocal('backupDetail').phrase,
				sourceName: storage.getLocal('backupDetail').sourceName,
				position: storage.getLocal('backupDetail').position,
				backupTime: storage.getLocal('backupDetail').backupTime
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
			namespace: namespace.name,
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

	const releaseMiddleware = (record: any) => {
		switch (record.sourceType) {
			case 'mysql':
				history.push(
					`/serviceList/mysql/MySQL/mysqlCreate/${
						middlewareInfo?.chartVersion
					}/${record.sourceName}/${record.backupFileName}/${
						storage.getLocal('backupDetail').namespace
					}`
				);
				break;
			case 'redis':
				history.push(
					`/serviceList/redis/Redis/redisCreate/${
						middlewareInfo?.chartVersion
					}/${record.sourceName}/backup/${
						storage.getLocal('backupDetail').namespace
					}`
				);
				break;
			case 'elasticsearch':
				history.push(
					`/serviceList/elasticsearch/Elasticsearch/elasticsearchCreate/${
						middlewareInfo?.chartVersion
					}/${record.sourceName}/backup/${
						storage.getLocal('backupDetail').namespace
					}`
				);
				break;
			case 'rocketmq':
				history.push(
					`/serviceList/rocketmq/rocketMQ/rocketmqCreate/${
						middlewareInfo?.chartVersion
					}/${record.sourceName}/backup/${
						storage.getLocal('backupDetail').namespace
					}`
				);
				break;
		}
	};

	const actionRender = (value: any, record: any, index: number) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => releaseMiddleware(record)}
					// onClick={() => {
					// 	if (record.sourceType === 'mysql') {
					// 		history.push(
					// 			`/serviceList/mysql/MySQL/mysqlCreate/${middlewareInfo?.chartVersion}/${record.sourceName}/${record.backupFileName}/${record.namespace}`
					// 		);
					// 	} else {
					// 		const result = {
					// 			clusterId: cluster.id,
					// 			namespace: namespace.name,
					// 			middlewareName:
					// 				storage.getLocal('backupDetail').sourceName,
					// 			type: storage.getLocal('backupDetail')
					// 				.sourceType,
					// 			cron: storage.getLocal('backupDetail').cron,
					// 			backupName:
					// 				storage.getLocal('backupDetail').backupName,
					// 			addressName:
					// 				storage.getLocal('backupDetail').addressName
					// 		};
					// 		applyBackup(result).then((res) => {
					// 			if (res.success) {
					// 				notification.success({
					// 					message: '成功',
					// 					description: '恢复成功'
					// 				});
					// 			} else {
					// 				notification.error({
					// 					message: '失败',
					// 					description: res.errorMsg
					// 				});
					// 			}
					// 		});
					// 	}
					// }}
				>
					克隆服务
				</LinkButton>
				<LinkButton
					onClick={() => {
						Modal.confirm({
							title: '操作确认',
							content: '删除后将无法恢复，请确认执行',
							onOk: () => {
								const result = {
									clusterId: cluster.id,
									namespace:
										storage.getLocal('backupDetail')
											.namespace || namespace.name,
									type: record.sourceType,
									backupName: record.backupName,
									backupId: record.backupId,
									backupFileName: record.backupFileName || '',
									addressName: record.addressName
								};
								deleteBackups(result).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '删除成功'
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
			keyword: params.backupName,
			clusterId: cluster.id,
			namespace,
			middlewareName: params?.name || '',
			type: params?.type || ''
		};
		getBackupTasks(sendData).then((res) => {
			if (res.success) {
				setBasicData({
					title: '基础信息',
					cron: res.data[0].cron,
					phrase: res.data[0].phrase,
					sourceName: res.data[0].sourceName,
					position: res.data[0].position,
					backupTime: res.data[0].backupTime
				});
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onCreate = () => {
		const sendData = {
			backupName: params.backupName,
			clusterId: cluster.id,
			namespace: namespace.name,
			cron: storage.getLocal('backupDetail').cron,
			type: params.type
		};
		editBackupTasks(sendData).then((res) => {
			console.log(res);
			getBasicInfo();
		});
	};
	return (
		<ProPage>
			<ProHeader
				title="定时备份任务1（正常）"
				onBack={() => history.goBack()}
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
						title="备份使用量(GB)"
						dataIndex="percent"
						render={nullRender}
					/>
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
					data={storage.getLocal('backupDetail')}
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
				/>
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(BackupTaskDetail);
