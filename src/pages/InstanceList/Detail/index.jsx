import React, { useState, useEffect } from 'react';
import { Page } from '@alicloud/console-components-page';
import { useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Dialog, Message, Icon } from '@alicloud/console-components';
import { Tab } from '@alicloud/console-components';
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
const { Menu } = Page;
const InstanceDetails = (props) => {
	const {
		globalVar,
		match: {
			params: { middlewareName, type, chartVersion, currentTab }
		},
		setCluster,
		setNamespace,
		setRefreshCluster
	} = props;
	const {
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList
	} = globalVar;
	const [selectedKey, setSelectedKey] = useState(currentTab);
	const [data, setData] = useState();
	const [status, setStatus] = useState();
	const [customMid, setCustomMid] = useState(false); // * 判断是否是自定义中间件
	const [visible, setVisible] = useState(false);
	const [waringVisible, setWaringVisible] = useState(true);
	const [reason, setReason] = useState('');
	// const [storageClassName, setStorageClassName] = useState('');
	const history = useHistory();
	const location = useLocation();
	const backKey = storage.getLocal('backKey');
	const [activeKey, setActiveKey] = useState(
		storage.getLocal('backKey') === ''
			? 'basicInfo'
			: storage.getLocal('backKey')
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
		if (location.query) {
			let { query } = location;
			// setSelectedKey(query.key);
			storage.setLocal('backKey', query.key);
		}
		// * 强制刷新
		// if (location.state) {
		// 	if (location.state.flag) {
		// 		window.location.reload();
		// 	}
		// }
		backKey &&
			backKey.indexOf('backupRecovery') !== -1 &&
			setActiveKey('backupRecovery');
		backKey && backKey === 'alarm' && setActiveKey('alarm');
	}, []);

	const menuSelect = (selectedKeys) => {
		setSelectedKey(selectedKeys[0]);
	};

	const getData = (clusterId, namespace) => {
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

	const refresh = (key = selectedKey) => {
		getData(globalVar.cluster.id, globalVar.namespace.name);
		// setSelectedKey(key);
		setActiveKey(key);
		// storage.setLocal('backKey', 'basicInfo');
	};

	// const DetailMenu = ({ selected, handleMenu }) => (
	// 	<Menu
	// 		id="mid-menu"
	// 		selectedKeys={selected}
	// 		onSelect={handleMenu}
	// 		direction="hoz"
	// 	>
	// 		<Menu.Item key="basicInfo">基本信息</Menu.Item>
	// 		<Menu.Item key="highAvailability">实例详情</Menu.Item>
	// 		{type === 'mysql' || type === 'elasticsearch' ? (
	// 			<Menu.Item key="backupRecovery">数据安全</Menu.Item>
	// 		) : null}
	// 		<Menu.Item key="externalAccess">服务暴露</Menu.Item>
	// 		<Menu.Item key="monitor">数据监控</Menu.Item>
	// 		<Menu.Item key="log">日志详情</Menu.Item>
	// 		<Menu.Item key="paramterSetting">参数设置</Menu.Item>
	// 		<Menu.Item key="alarm">服务告警</Menu.Item>
	// 		{type === 'mysql' ? (
	// 			<Menu.Item key="disaster">灾备服务</Menu.Item>
	// 		) : null}
	// 	</Menu>
	// );

	const childrenRender = (key) => {
		switch (key) {
			case 'basicInfo':
				return (
					<BasicInfo
						middlewareName={middlewareName}
						type={type}
						data={data}
						clusterId={globalVar.cluster.id}
						namespace={globalVar.namespace.name}
						chartName={type}
						chartVersion={chartVersion}
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
						monitor={globalVar.cluster.monitor}
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
	};

	const statusRender = (value) => {
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
			(item) => item.id === data.mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		const ns = globalNamespaceList.filter(
			(item) => item.name === data.mysqlDTO.relationNamespace
		);
		setNamespace(ns[0]);
		storage.setLocal('namespace', JSON.stringify(ns[0]));
		setRefreshCluster(true);
		history.push({
			pathname: `/serviceList/basicInfo/${data.mysqlDTO.relationName}/${
				data.mysqlDTO.type || 'mysql'
			}/${chartVersion}`,
			state: {
				flag: true
			}
		});
		// setSelectedKey('basicInfo');
		setActiveKey('basicInfo');
		storage.setLocal('backKey', 'basicInfo');
	};
	const acrossCluster = () => {
		const cs = globalClusterList.filter(
			(item) => item.id === data.mysqlDTO.relationClusterId
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
						(item) => item.name === data.mysqlDTO.relationNamespace
					);
					setNamespace(ns[0]);
					storage.setLocal('namespace', JSON.stringify(ns[0]));
					setRefreshCluster(true);
					history.push({
						pathname: `/serviceList/basicInfo/${
							data.mysqlDTO.relationName
						}/${data.mysqlDTO.type || 'mysql'}/${chartVersion}`,
						state: {
							flag: true
						}
					});
				}
			}
		});
		// setSelectedKey('basicInfo');
		setActiveKey('basicInfo');
	};
	const SecondConfirm = (props) => {
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
		if (!data.mysqlDTO.relationExist) {
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

	const onChange = (key) => {
		setActiveKey(key);
		storage.setLocal('backKey', key);
	};

	useEffect(() => {
		return () => storage.setLocal('backKey', '');
	}, []);

	return (
		<Page>
			<Page.Header
				title={
					<h1>{`${type}:${middlewareName}(${
						statusRender(status) || ''
					})`}</h1>
				}
				hasBackArrow
				renderBackArrow={(elem) => (
					<span
						className="details-go-back"
						onClick={() => window.history.back()}
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
					onClick={() =>
						refresh(storage.getLocal('backKey') || 'basicInfo')
					}
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
			</Page.Header>
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
			{/* <div style={{ padding: '0px 40px 15px 40px' }}>
				<DetailMenu selected={selectedKey} handleMenu={menuSelect} />
			</div> */}
			<Page.Content>
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
			</Page.Content>
			<SecondConfirm
				visible={visible}
				onCancel={() => setVisible(false)}
			/>
		</Page>
	);
};
export default connect(
	({ globalVar }) => ({
		globalVar
	}),
	{
		setCluster,
		setNamespace,
		setRefreshCluster
	}
)(InstanceDetails);
