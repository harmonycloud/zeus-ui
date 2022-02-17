import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Page, Header, Content } from '@alicloud/console-components-page';
import {
	Button,
	Dialog,
	Message,
	Icon,
	Tab
} from '@alicloud/console-components';

import BasicInfo from './BasicInfo/index';
import HighAvailability from './HighAvailability/index';
import BackupRecovery from './BackupRecovery/index';
import ExternalAccess from './ExternalAccess/index';
import Monitor from './Monitor/index';
import Log from './Log/index';
import ServerAlarm from './ServeAlarm';
import ParamterSetting from './ParamterSetting/index';
import Disaster from './Disaster/index';

import { getMiddlewareDetail } from '@/services/middleware';
import { getNamespaces } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import storage from '@/utils/storage';

import './detail.scss';
import { DetailParams, InstanceDetailsProps } from './detail';
import { middlewareDetailProps, monitorProps } from '@/types/comment';
import { StoreState } from '@/types';

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

const InstanceDetails = (props: InstanceDetailsProps) => {
	const { globalVar, setCluster, setNamespace, setRefreshCluster } = props;
	const {
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList
	} = globalVar;
	const history = useHistory();
	const params: DetailParams = useParams();
	const { middlewareName, type, chartVersion, currentTab, name, aliasName } =
		params;

	const [data, setData] = useState<middlewareDetailProps>();
	const [status, setStatus] = useState<string>('');
	const [customMid, setCustomMid] = useState<boolean>(false); // * 判断是否是自定义中间件
	const [visible, setVisible] = useState<boolean>(false);
	const [waringVisible, setWaringVisible] = useState<boolean>(true);
	const [reason, setReason] = useState<string>('');
	const [activeKey, setActiveKey] = useState<string>(
		currentTab || 'basicInfo'
	);

	useEffect(() => {
		if (
			JSON.stringify(globalVar.cluster) !== '{}' &&
			JSON.stringify(globalVar.namespace) !== '{}'
		) {
			getData(globalVar.cluster.id, globalVar.namespace.name);
		}
	}, [globalVar]);

	useEffect(() => {
		setActiveKey(currentTab);
	}, []);

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
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const refresh = (key = activeKey) => {
		getData(globalVar.cluster.id, globalVar.namespace.name);
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
							namespace={globalVar.namespace.name}
							customMid={customMid}
							onRefresh={refresh}
							toDetail={toDetail}
						/>
					);
				case 'highAvailability':
					return (
						<HighAvailability
							type={type}
							data={data}
							clusterId={globalVar.cluster.id}
							namespace={globalVar.namespace.name}
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
							namespace={globalVar.namespace.name}
							customMid={customMid}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'externalAccess':
					return (
						<ExternalAccess
							type={type}
							middlewareName={middlewareName}
							customMid={customMid}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'monitor':
					return (
						<Monitor
							type={type}
							middlewareName={middlewareName}
							monitor={globalVar.cluster.monitor}
							clusterId={globalVar.cluster.id}
							namespace={globalVar.namespace.name}
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
							namespace={globalVar.namespace.name}
							customMid={customMid}
							logging={globalVar.cluster.logging}
							capabilities={(data && data.capabilities) || []}
						/>
					);
				case 'paramterSetting':
					return (
						<ParamterSetting
							middlewareName={middlewareName}
							clusterId={globalVar.cluster.id}
							namespace={globalVar.namespace.name}
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
							namespace={globalVar.namespace.name}
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
							namespace={globalVar.namespace.name}
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
	const unAcrossCluster = () => {
		const cs = globalClusterList.filter(
			(item) => item.id === data?.mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		const ns = globalNamespaceList.filter(
			(item) => item.name === data?.mysqlDTO.relationNamespace
		);
		setNamespace(ns[0]);
		storage.setLocal('namespace', JSON.stringify(ns[0]));
		setRefreshCluster(true);
		history.push({
			pathname: `/serviceList/${name}/${aliasName}/basicInfo/${
				data?.mysqlDTO.relationName
			}/${data?.mysqlDTO.type || 'mysql'}/${chartVersion}`,
			state: {
				flag: true
			}
		});
	};
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
					setNamespace(ns[0]);
					storage.setLocal('namespace', JSON.stringify(ns[0]));
					setRefreshCluster(true);
					history.push({
						pathname: `/serviceList${name}/${aliasName}/basicInfo/${
							data?.mysqlDTO.relationName
						}/${data?.mysqlDTO.type || 'mysql'}/${chartVersion}`,
						state: {
							flag: true
						}
					});
				}
			}
		});
	};
	const SecondConfirm = (props: {
		visible: boolean;
		onCancel: () => void;
	}) => {
		const { visible, onCancel } = props;
		const onOk = () => {
			storage.setLocal('firstAlert', 1);
			onCancel();
			acrossCluster();
		};
		const onConfirm = () => {
			onCancel();
			acrossCluster();
		};
		return (
			<Dialog
				title="操作确认"
				visible={visible}
				footerAlign="right"
				footer={
					<div>
						<Button type="primary" onClick={onOk}>
							好的，下次不在提醒
						</Button>
						<Button type="normal" onClick={onConfirm}>
							确认
						</Button>
					</div>
				}
			>
				该备用服务不在当前资源池资源分区，返回源服务页面请点击右上角“返回源服务”按钮
			</Dialog>
		);
	};
	const toDetail = () => {
		if (!data?.mysqlDTO.relationExist) {
			Message.show(
				messageConfig('error', '失败', '该关联实例不存在，无法进行跳转')
			);
			return;
		} else {
			// * 源示例和备服务在用一个资源池时
			if (data.mysqlDTO.relationClusterId === globalVar.cluster.id) {
				unAcrossCluster();
			} else {
				// across the cluster
				const flag = storage.getLocal('firstAlert');
				if (flag === 0) {
					setVisible(true);
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
			`/serviceList/${name}/${aliasName}/${key}/${middlewareName}/${type}/${chartVersion}`
		);
	};

	useEffect(() => {
		return () => {
			localStorage.removeItem('backupTab');
		};
	}, []);

	return (
		<Page>
			<Header
				title={
					<h1>{`${type}:${middlewareName}(${
						statusRender(status) || ''
					})`}</h1>
				}
				hasBackArrow
				renderBackArrow={(elem: any) => (
					<span
						className="details-go-back"
						onClick={() =>
							history.push(`/serviceList/${name}/${aliasName}`)
						}
					>
						{elem}
					</span>
				)}
				childrenAlign="right"
				subTitle={
					data?.mysqlDTO?.openDisasterRecoveryMode &&
					data?.mysqlDTO?.isSource === false ? (
						<div className="gray-circle" style={{ marginTop: 9 }}>
							备
						</div>
					) : null
				}
			>
				<Button
					onClick={() => refresh(activeKey)}
					style={{ padding: '0 9px', marginRight: '8px' }}
				>
					<Icon type="refresh" />
				</Button>
				{data?.mysqlDTO?.openDisasterRecoveryMode &&
				data?.mysqlDTO?.isSource === false ? (
					<Button type="primary" onClick={toDetail}>
						返回源服务
					</Button>
				) : null}
			</Header>
			{waringVisible && reason && status !== 'Running' && (
				<div className="warning-info">
					<Icon
						className="warning-icon"
						size={'small'}
						type="warning"
					/>
					<span className="info-text">{reason}</span>
					<Icon
						className="warning-close"
						size={'xxs'}
						type="times"
						onClick={() => setWaringVisible(false)}
					/>
				</div>
			)}
			<Content>
				<Tab
					navStyle={{ marginBottom: '15px' }}
					activeKey={activeKey}
					onChange={onChange}
				>
					<Tab.Item title="基本信息" key="basicInfo">
						{childrenRender('basicInfo')}
					</Tab.Item>
					<Tab.Item title="实例详情" key="highAvailability">
						{childrenRender('highAvailability')}
					</Tab.Item>
					{type === 'mysql' || type === 'elasticsearch' ? (
						<Tab.Item title="数据安全" key="backupRecovery">
							{childrenRender('backupRecovery')}
						</Tab.Item>
					) : null}
					<Tab.Item title="服务暴露" key="externalAccess">
						{childrenRender('externalAccess')}
					</Tab.Item>
					<Tab.Item title="数据监控" key="monitor">
						{childrenRender('monitor')}
					</Tab.Item>
					<Tab.Item title="日志详情" key="log">
						{childrenRender('log')}
					</Tab.Item>
					<Tab.Item title="参数设置" key="paramterSetting">
						{childrenRender('paramterSetting')}
					</Tab.Item>
					<Tab.Item title="服务告警" key="alarm">
						{childrenRender('alarm')}
					</Tab.Item>
					{type === 'mysql' ? (
						<Tab.Item title="灾备服务" key="disaster">
							{childrenRender('disaster')}
						</Tab.Item>
					) : null}
				</Tab>
			</Content>
			<SecondConfirm
				visible={visible}
				onCancel={() => setVisible(false)}
			/>
		</Page>
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
