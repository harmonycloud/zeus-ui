import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { useHistory } from 'react-router';
import DataFields from '@/components/DataFields';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import moment from 'moment';
import { getBackups, applyBackup, deleteBackups } from '@/services/backup';
import storage from '@/utils/storage';
import { middlewareProps } from '@/pages/ServiceList/service.list';
import { getCanReleaseMiddleware } from '@/services/middleware';
import { StoreState } from '@/types';
import { connect } from 'react-redux';
import { notification } from 'antd';
import { nullRender } from '@/utils/utils';

const LinkButton = Actions.LinkButton;

const info = {
	title: '基础信息',
	phrase: '',
	sourceName: '',
	position: '',
	backupTime: '',
	cron: ''
};
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
		label: '状态情况'
	},
	{
		dataIndex: 'sourceName',
		label: '备份源名称',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'cron',
		label: '备份方式',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val ? '周期' : '单次'}
				{/* {val.split('* *')} */}
				{/* {val
					? val
							.split('* *')
							.map((item: string) => weekMap[item])
							.join('、')
					: '/'} */}
				{/* {val
					? moment(formData.time).get('hour') +
					  ':' +
					  moment(formData.time).get('minute')
					: ''}
				） } */}
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

function BackupTaskDetail(props: any): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const history = useHistory();
	const params: any = useParams();
	const [data, setData] = useState();
	const [basicData, setBasicData] = useState<any>(info);
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();

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

	const releaseMiddleware = (chartName: string) => {
		switch (chartName) {
			case 'mysql':
				history.push(
					`/serviceList/${chartName}/MySql/mysqlCreate/${middlewareInfo?.chartVersion}`
				);
				break;
			case 'redis':
				history.push(
					`/serviceList/${chartName}Redis/redisCreate/${middlewareInfo?.chartVersion}`
				);
				break;
			case 'elasticsearch':
				history.push(
					`/serviceList/${chartName}/Elasticsearch/elasticsearchCreate/${middlewareInfo?.chartVersion}`
				);
				break;
			case 'rocketmq':
				history.push(
					`/serviceList/${chartName}/Rocketmq/rocketmqCreate/${middlewareInfo?.chartVersion}`
				);
				break;
		}
	};

	const actionRender = (value: any, record: any, index: number) => {
		return (
			<Actions>
				<LinkButton
					// onClick={() => releaseMiddleware(record.sourceType)}
					onClick={() => {
						if (record.sourceType === 'mysql') {
							history.push(
								`/serviceList/mysql/MySQL/mysqlCreate/${
									middlewareInfo?.chartVersion
								}/${record.sourceName}/${
									record.backupFileName || 1
								}`
							);
						} else {
							const result = {
								clusterId: cluster.id,
								namespace: namespace.name,
								middlewareName:
									storage.getLocal('backupDetail').sourceName,
								type: storage.getLocal('backupDetail')
									.sourceType,
								cron: storage.getLocal('backupDetail').cron,
								backupName:
									storage.getLocal('backupDetail').backupName,
								addressName:
									storage.getLocal('backupDetail').addressName
							};
							applyBackup(result).then((res) => {
								if (res.success) {
									notification.success({
										message: '成功',
										description: '恢复成功'
									});
								} else {
									notification.error({
										message: '失败',
										description: res.errorMsg
									});
								}
							});
						}
					}}
				>
					克隆服务
				</LinkButton>
				<LinkButton
					onClick={() => {
						const result = {
							clusterId: cluster.id,
							namespace: namespace.name,
							type: record.sourceType,
							backupName: record.backupName,
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
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
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
					rowKey="key"
				>
					<ProTable.Column title="备份记录" dataIndex="taskName" />
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
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(BackupTaskDetail);
