import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { getBackups } from '@/services/backup';
import { middlewareProps } from '@/pages/ServiceList/service.list';
import { getCanReleaseMiddleware } from '@/services/middleware';
import moment from 'moment';
import TableRadio from '@/components/TableRadio';
import { Radio, notification, Button, Divider } from 'antd';
import storage from '@/utils/storage';

const columns = [
	{ title: '备份记录', dataIndex: 'backupName' },
	{
		title: '备份时间',
		dataIndex: 'creationTime',
		sorter: (a: any, b: any) =>
			moment(a.creationTime).unix() - moment(b.creationTime).unix()
	}
];

function ProBackupBask(): JSX.Element {
	const params: any = useParams();
	const history = useHistory();
	const { backupName, clusterId, namespace, type } = params;
	const [recoveryType, setRecoveryType] = useState<string>('time');
	const [list, setList] = useState();
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();
	const backupDetail = storage.getLocal('backupDetail');
	const [selectedRow, setSelectedRow] = useState<any>();
	const [selectedRowKeys, setSelectedRowKeys] = useState();

	useEffect(() => {
		getCanReleaseMiddleware({
			clusterId,
			type
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
	}, []);

	const releaseMiddleware = () => {
		switch (backupDetail.sourceType) {
			case 'mysql':
				history.push(
					`/serviceList/mysql/MySQL/mysqlCreate/${
						middlewareInfo?.chartVersion
					}/${
						selectedRow?.sourceName || backupDetail.sourceName
					}/backup/${backupDetail.backupFileName}/${
						selectedRow?.namespace || backupDetail.namespace
					}`
				);
				storage.setSession('menuPath', 'serviceList/mysql/MySQL');
				recoveryType === 'time' &&
					storage.setLocal('backupDetail', {
						...backupDetail,
						recoveryType: 'time'
					});
				break;
			case 'postgresql':
				history.push(
					`/serviceList/postgresql/PostgreSQL/postgresqlCreate/${
						middlewareInfo?.chartVersion
					}/${
						selectedRow?.sourceName || backupDetail.sourceName
					}/backup/${
						selectedRow?.namespace || backupDetail.namespace
					}`
				);
				storage.setSession(
					'menuPath',
					'serviceList/postgresql/PostgreSQL'
				);
				recoveryType === 'time' &&
					storage.setLocal('backupDetail', {
						...backupDetail,
						recoveryType: 'time'
					});
				break;
			case 'redis':
				history.push(
					`/serviceList/redis/Redis/redisCreate/${middlewareInfo?.chartVersion}/${selectedRow?.sourceName}/backup/${selectedRow?.namespace}`
				);
				storage.setSession('menuPath', 'serviceList/redis/Redis');
				break;
			case 'elasticsearch':
				history.push(
					`/serviceList/elasticsearch/Elasticsearch/elasticsearchCreate/${middlewareInfo?.chartVersion}/${selectedRow?.sourceName}/backup/${selectedRow?.namespace}`
				);
				storage.setSession(
					'menuPath',
					'serviceList/elasticsearch/Elasticsearch'
				);
				break;
			case 'rocketmq':
				history.push(
					`/serviceList/rocketmq/rocketMQ/rocketmqCreate/${middlewareInfo?.chartVersion}/${selectedRow?.sourceName}/backup/${selectedRow?.namespace}`
				);
				storage.setSession('menuPath', 'serviceList/rocketmq/rocketMQ');
				break;
		}
	};

	useEffect(() => {
		getBackups({
			backupName,
			clusterId,
			namespace,
			type
		}).then((res) => {
			if (res.success) {
				setList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);

	return (
		<ProPage>
			<ProHeader
				title="备份恢复"
				subTitle="发布中间件需要使用的备份任务"
				onBack={() => history.goBack()}
			/>
			<ProContent>
				<h2>恢复方式</h2>
				<Radio.Group
					onChange={(e) => setRecoveryType(e.target.value)}
					value={recoveryType}
				>
					<Radio value="time">选择时间点恢复</Radio>
					<Radio value="record">选择备份记录恢复</Radio>
				</Radio.Group>
				{recoveryType === 'record' ? (
					<TableRadio
						dataSource={list}
						columns={columns}
						rowKey="backupName"
						style={{ marginTop: 16 }}
						selectedRow={selectedRow}
						setSelectedRow={setSelectedRow}
						selectedRowKeys={selectedRowKeys}
						setSelectedRowKeys={setSelectedRowKeys}
					/>
				) : null}
				<Divider />
				<div>
					<Button
						type="primary"
						style={{ marginRight: 16 }}
						onClick={() => {
							if (recoveryType === 'record') {
								if (selectedRow) {
									releaseMiddleware();
								} else {
									notification.error({
										message: '失败',
										description: '请选择备份源'
									});
								}
							} else {
								if (backupDetail.pause === 'off') {
									releaseMiddleware();
								} else {
									notification.error({
										message: '失败',
										description: '增量备份未开启'
									});
								}
							}
						}}
					>
						确认
					</Button>
					<Button onClick={() => history.goBack()}>取消</Button>
				</div>
			</ProContent>
		</ProPage>
	);
}

export default ProBackupBask;
