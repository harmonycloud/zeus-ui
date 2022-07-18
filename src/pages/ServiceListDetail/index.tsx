import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { Button, Modal, Tabs, notification, Alert } from 'antd';

import BasicInfo from './BasicInfo/index';
import HighAvailability from './HighAvailability/index';
import BackupRecovery from './BackupRecovery/index';
import ExternalAccess from './ExternalAccess/index';
import Monitor from './Monitor/index';
import Log from './Log/index';
import ServerAlarm from './ServeAlarm';
import ParamterSetting from './ParamterSetting/index';
import Disaster from './Disaster/index';
import DataBase from './Database/index';
import RedisDataBase from './RedisDatabase/index';
import ServiceDetailIngress from './ServiceIngress';

import { getMiddlewareDetail } from '@/services/middleware';
import { getNamespaces } from '@/services/common';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import storage from '@/utils/storage';

import './detail.scss';
import { DetailParams, InstanceDetailsProps } from './detail';
import { middlewareDetailProps, monitorProps } from '@/types/comment';
import { StoreState, User } from '@/types';
import { ReloadOutlined } from '@ant-design/icons';

/*
 * 自定义中间tab页显示判断 后端
 * 基本信息  basic
 * 高可用性  high
 * 备份恢复  backup
 * 对外访问  ingress
 * 性能监控  monitoring
 * 日志管理  log
 * 参数设置  config
 * 阈值告警  alert
 * 灾备服务  disaster(目前mysql中间件特有)
 */

const { TabPane } = Tabs;
const InstanceDetails = (props: InstanceDetailsProps) => {
	const { globalVar, setCluster, setNamespace, setRefreshCluster } = props;
	const {
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList,
		project,
		namespace: globalNamespace
	} = globalVar;
	const history = useHistory();
	const params: DetailParams = useParams();
	const {
		middlewareName,
		type,
		chartVersion,
		currentTab,
		name,
		aliasName,
		namespace
	} = params;
	const [data, setData] = useState<middlewareDetailProps>();
	const [status, setStatus] = useState<string>('');
	const [customMid, setCustomMid] = useState<boolean>(false); // * 判断是否是自定义中间件
	const [reason, setReason] = useState<string>('');
	const [activeKey, setActiveKey] = useState<string>(
		currentTab || 'basicInfo'
	);
	const [operateFlag, setOperateFlag] = useState<boolean>(false);

	useEffect(() => {
		if (JSON.stringify(globalVar.cluster) !== '{}') {
			getData(globalVar.cluster.id, namespace);
		}
	}, [globalVar]);

	useEffect(() => {
		setActiveKey(currentTab);
		const jsonRole: User = JSON.parse(storage.getLocal('role'));
		if (jsonRole.userRoleList.some((i: any) => i.roleId === 1)) {
			setOperateFlag(true);
		}
	}, []);
	useEffect(() => {
		const jsonRole: User = JSON.parse(storage.getLocal('role'));
		if (jsonRole.userRoleList.every((i: any) => i.roleId !== 1)) {
			if (JSON.stringify(project) !== '{}') {
				const operateFlag =
					jsonRole.userRoleList.find(
						(item) => item.projectId === project.projectId
					)?.power[type][1] === '1'
						? true
						: false;
				setOperateFlag(operateFlag);
			}
		}
	}, [project]);

	const getData = (clusterId: string, namespace: string) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type
		};
		getMiddlewareDetail(sendData).then((res) => {
			if (res.success) {
				setData(res.data);
				setReason(res.data.reason);
				setStatus(res.data.status || 'Failed');
				if (res.data.dynamicValues) {
					setCustomMid(true);
				} else {
					setCustomMid(false);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const refresh = (key = activeKey) => {
		getData(globalVar.cluster.id, namespace);
		setActiveKey(key);
	};

	const childrenRender = (key: string) => {
		if (data) {
			switch (key) {
				case 'basicInfo':
					return (
						<BasicInfo
							middlewareName={middlewareName}
							type={type}
							data={data}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							customMid={customMid}
							onRefresh={refresh}
							toDetail={toDetail}
							operateFlag={operateFlag}
						/>
					);
				case 'highAvailability':
					return (
						<HighAvailability
							type={type}
							data={data}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							chartName={type}
							chartVersion={chartVersion}
							onRefresh={refresh}
							customMid={customMid}
						/>
					);
				case 'backupRecovery':
					return (
						<BackupRecovery
							type={type}
							data={data}
							storage={globalVar.cluster.storage}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							customMid={customMid}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'externalAccess':
					return (
						<ServiceDetailIngress
							name={name}
							aliasName={aliasName}
							middlewareName={middlewareName}
							chartVersion={chartVersion}
							namespace={namespace}
							customMid={customMid}
							clusterId={globalVar.cluster.id}
							capabilities={(data && data.capabilities) || []}
							mode={data.mode}
							readWriteProxy={data?.readWriteProxy}
							brokerNum={
								name === 'kafka'
									? data.kafkaDTO.brokerNum
									: name === 'rocketmq'
									? data.rocketMQParam.brokerNum
									: null
							}
						/>
					);
				// case 'externalAccess':
				// 	return (
				// 		<ExternalAccess
				// 			type={type}
				// 			middlewareName={middlewareName}
				// 			namespace={namespace}
				// 			customMid={customMid}
				// 			capabilities={(data && data.capabilities) || []}
				// 		/>
				// 	);
				case 'monitor':
					return (
						<Monitor
							type={type}
							middlewareName={middlewareName}
							monitor={globalVar.cluster.monitor}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							customMid={customMid}
							chartVersion={chartVersion}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'log':
					return (
						<Log
							type={type}
							data={data}
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							customMid={customMid}
							logging={globalVar.cluster.logging}
							onRefresh={refresh}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'paramterSetting':
					return (
						<ParamterSetting
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							type={type}
							customMid={customMid}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'alarm':
					return (
						<ServerAlarm
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							type={type}
							customMid={customMid}
							capabilities={(data && data.capabilities) || []}
							monitor={globalVar.cluster.monitor as monitorProps}
							alarmType={'service'}
						/>
					);
				case 'disaster':
					return (
						<Disaster
							chartName={type}
							chartVersion={chartVersion}
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							data={data}
							onRefresh={refresh}
							toDetail={toDetail}
						/>
					);
				case 'database':
					return (
						<DataBase
							chartName={type}
							chartVersion={chartVersion}
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							data={data}
							onRefresh={refresh}
							toDetail={toDetail}
						/>
					);
				case 'redisDatabase':
					return (
						<RedisDataBase
							chartName={type}
							chartVersion={chartVersion}
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={namespace}
							data={data}
							onRefresh={refresh}
							toDetail={toDetail}
						/>
					);
			}
		}
	};

	const statusRender = (value: string) => {
		switch (value) {
			case 'Running':
				return '运行正常';
			case 'Creating':
				return '启动中';
			case undefined:
				return '';
			default:
				return '运行异常';
		}
	};
	// todo 服务详情页路由修改
	const unAcrossCluster = () => {
		const cs = globalClusterList.filter(
			(item) => item.id === data?.mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		const ns = globalNamespaceList.filter(
			(item) => item.name === data?.mysqlDTO.relationNamespace
		);
		if (globalNamespace.name !== '*') {
			setNamespace(ns[0]);
			storage.setLocal('namespace', JSON.stringify(ns[0]));
		}
		setRefreshCluster(true);
		history.push({
			pathname: `/serviceList/${name}/${aliasName}/basicInfo/${data?.mysqlDTO.relationName}/mysql/${chartVersion}/${data?.mysqlDTO.relationNamespace}`,
			state: {
				flag: true
			}
		});
	};
	// todo 服务详情页路由修改
	const acrossCluster = () => {
		const cs = globalClusterList.filter(
			(item) => item.id === data?.mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		getNamespaces({
			clusterId: cs[0].id,
			withQuota: true
		}).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					const ns = res.data.filter(
						(item: any) =>
							item.name === data?.mysqlDTO.relationNamespace
					);
					if (globalNamespace.name !== '*') {
						setNamespace(ns[0]);
						storage.setLocal('namespace', JSON.stringify(ns[0]));
					}
					setRefreshCluster(true);
					history.push({
						pathname: `/serviceList${name}/${aliasName}/basicInfo/${data?.mysqlDTO.relationName}/mysql/${chartVersion}/${data?.mysqlDTO.relationNamespace}`,
						state: {
							flag: true
						}
					});
				}
			}
		});
	};
	const toDetail = () => {
		if (!data?.mysqlDTO.relationExist) {
			notification.error({
				message: '失败',
				description: '该关联实例不存在，无法进行跳转'
			});
			return;
		} else {
			// * 源示例和备服务在用一个集群时
			if (data.mysqlDTO.relationClusterId === globalVar.cluster.id) {
				unAcrossCluster();
			} else {
				// across the cluster
				const flag = storage.getLocal('firstAlert');
				if (flag === 0) {
					Modal.confirm({
						title: '操作确认',
						content:
							'该备用服务不在当前集群命名空间，返回源服务页面请点击右上角“返回源服务”按钮',
						okText: '好的，下次不再提醒',
						cancelText: '确认',
						onOk: () => {
							storage.setLocal('firstAlert', 1);
							acrossCluster();
						},
						onCancel: () => {
							acrossCluster();
						}
					});
				} else {
					acrossCluster();
				}
			}
		}
	};

	const onChange = (key: string | number) => {
		setActiveKey(key as string);
		storage.removeSession('paramsTab');
		history.push(
			`/serviceList/${name}/${aliasName}/${key}/${middlewareName}/${type}/${chartVersion}/${namespace}`
		);
	};

	useEffect(() => {
		return () => {
			localStorage.removeItem('backupTab');
		};
	}, []);

	return (
		<ProPage>
			<ProHeader
				title={
					<h1>{`${type}:${middlewareName}(${
						statusRender(status) || ''
					})`}</h1>
				}
				onBack={(elem: any) =>
					history.push(`/serviceList/${name}/${aliasName}`)
				}
				subTitle={
					data?.mysqlDTO?.openDisasterRecoveryMode &&
					data?.mysqlDTO?.isSource === false ? (
						<div className="gray-circle" style={{ marginTop: 9 }}>
							备
						</div>
					) : null
				}
				extra={
					<>
						<Button
							onClick={() => refresh(activeKey)}
							style={{ padding: '0 9px', marginRight: '8px' }}
						>
							<ReloadOutlined />
						</Button>
						{data?.mysqlDTO?.openDisasterRecoveryMode &&
						data?.mysqlDTO?.isSource === false ? (
							<Button type="primary" onClick={toDetail}>
								返回源服务
							</Button>
						) : null}
					</>
				}
			></ProHeader>
			{reason && status !== 'Running' && (
				<Alert
					message={reason}
					type="warning"
					showIcon
					closable
					style={{ margin: '0 24px' }}
				/>
			)}
			<ProContent>
				<Tabs
					// navStyle={{ marginBottom: '15px' }}
					activeKey={activeKey}
					onChange={onChange}
				>
					<TabPane tab="基本信息" key="basicInfo">
						{childrenRender('basicInfo')}
					</TabPane>
					{operateFlag && (
						<TabPane tab="实例详情" key="highAvailability">
							{childrenRender('highAvailability')}
						</TabPane>
					)}
					{operateFlag &&
					(type === 'mysql' ||
						type === 'elasticsearch' ||
						type === 'redis' ||
						type === 'rocketmq') ? (
						<TabPane tab="数据安全" key="backupRecovery">
							{childrenRender('backupRecovery')}
						</TabPane>
					) : null}
					{operateFlag && (
						<TabPane tab="服务暴露" key="externalAccess">
							{childrenRender('externalAccess')}
						</TabPane>
					)}
					{operateFlag && (
						<TabPane tab="数据监控" key="monitor">
							{childrenRender('monitor')}
						</TabPane>
					)}
					{operateFlag && (
						<TabPane tab="日志详情" key="log">
							{childrenRender('log')}
						</TabPane>
					)}
					{operateFlag && (
						<TabPane tab="参数设置" key="paramterSetting">
							{childrenRender('paramterSetting')}
						</TabPane>
					)}
					{operateFlag && (
						<TabPane tab="服务告警" key="alarm">
							{childrenRender('alarm')}
						</TabPane>
					)}
					{operateFlag && type === 'mysql' ? (
						<TabPane tab="灾备服务" key="disaster">
							{childrenRender('disaster')}
						</TabPane>
					) : null}
					{operateFlag && type === 'mysql' ? (
						<TabPane tab="数据库管理" key="database">
							{childrenRender('database')}
						</TabPane>
					) : null}
					{type === 'redis' ? (
						<TabPane tab="数据库管理" key="redisDatabase">
							{childrenRender('redisDatabase')}
						</TabPane>
					) : null}
				</Tabs>
			</ProContent>
		</ProPage>
	);
};
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setCluster,
	setNamespace,
	setRefreshCluster
})(InstanceDetails);
