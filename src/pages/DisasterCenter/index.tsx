import React, { useState } from 'react';
import { useHistory } from 'react-router';
import SecondLayout from '@/components/SecondLayout';
import Disaster from '@/pages/ServiceListDetail/Disaster';
import { Button, Modal, notification } from 'antd';
import NoService from '@/components/NoService';

import { getMiddlewareDetail } from '@/services/middleware';
import storage from '@/utils/storage';
import { getNamespaces } from '@/services/common';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType, StoreState, globalVarProps, User } from '@/types';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import { connect } from 'react-redux';

interface disasterCenterProps {
	globalVar: globalVarProps;
	setCluster: (value: any) => void;
	setNamespace: (value: any) => void;
	setRefreshCluster: (flag: boolean) => void;
}
function DisasterCenter(props: disasterCenterProps) {
	const { setCluster, setNamespace, setRefreshCluster } = props;
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	const [operateFlag, setOperateFlag] = useState<boolean>(false);

	const {
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const history = useHistory();
	const onChange = (
		name: string | null,
		type: string,
		namespace: string,
		cluster: clusterType,
		aliasName?: string
	) => {
		if (name !== null) {
			setBasicData({
				name,
				type,
				clusterId: cluster.id,
				namespace
			});
			const jsonRole: User = JSON.parse(storage.getLocal('role'));
			let operateFlagTemp = false;
			if (jsonRole.userRoleList.some((item) => item.roleId === 1)) {
				operateFlagTemp = true;
			} else {
				operateFlagTemp =
					jsonRole.userRoleList.find(
						(item) => item.projectId === project.projectId
					)?.power[type][1] === '1'
						? true
						: false;
			}
			if (operateFlagTemp) {
				setOperateFlag(true);
				getMiddlewareDetail({
					clusterId: cluster.id,
					namespace,
					type,
					middlewareName: name
				}).then((res) => {
					if (res.success) {
						setIsService(true);
						setData(res.data);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				setIsService(false);
				setOperateFlag(false);
			}
		} else {
			setIsService(false);
		}
	};
	const getData = () => {
		getMiddlewareDetail({
			clusterId: basicData?.clusterId,
			namespace: basicData?.namespace,
			type: basicData?.type,
			middlewareName: basicData?.name
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
	const unAcrossCluster = () => {
		const cs = globalClusterList.filter(
			(item) =>
				item.id ===
				(data as middlewareDetailProps).mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		const ns = globalNamespaceList.filter(
			(item) =>
				item.name ===
				(data as middlewareDetailProps).mysqlDTO.relationNamespace
		);
		if (globalNamespace.name !== '*') {
			setNamespace(ns[0]);
			storage.setLocal('namespace', JSON.stringify(ns[0]));
		}
		setRefreshCluster(true);
		storage.setSession('menuPath', '/serviceList/mysql/MySQL');
		history.push({
			pathname: `/serviceList/mysql/MySQL/basicInfo/${
				(data as middlewareDetailProps).mysqlDTO.relationName
			}/mysql/${(data as middlewareDetailProps).chartVersion}/${
				(data as middlewareDetailProps).mysqlDTO.relationNamespace
			}`,
			state: {
				flag: true
			}
		});
	};
	const acrossCluster = () => {
		const cs = globalClusterList.filter(
			(item) =>
				item.id ===
				(data as middlewareDetailProps).mysqlDTO.relationClusterId
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
						(item: clusterType) =>
							item.name ===
							(data as middlewareDetailProps).mysqlDTO
								.relationNamespace
					);
					if (globalNamespace.name !== '*') {
						setNamespace(ns[0]);
						storage.setLocal('namespace', JSON.stringify(ns[0]));
					}
					setRefreshCluster(true);
					storage.setSession('menuPath', '/serviceList/mysql/MySQL');
					history.push({
						pathname: `/serviceList/mysql/MySQL/basicInfo/${
							(data as middlewareDetailProps).mysqlDTO
								.relationName
						}/mysql/${
							(data as middlewareDetailProps).chartVersion
						}/${
							(data as middlewareDetailProps).mysqlDTO
								.relationNamespace
						}`,
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
			<Modal
				title="操作确认"
				visible={visible}
				footer={
					<div>
						<Button type="primary" onClick={onOk}>
							好的，下次不在提醒
						</Button>
						<Button onClick={onConfirm}>确认</Button>
					</div>
				}
			>
				该备用服务不在当前集群命名空间，返回源服务页面请点击右上角“返回源服务”按钮
			</Modal>
		);
	};
	const toDetail = () => {
		if ((data as middlewareDetailProps).mysqlDTO.openDisasterRecoveryMode) {
			// * 源示例和备服务在用一个集群时
			if (
				(data as middlewareDetailProps).mysqlDTO.relationClusterId ===
				basicData?.clusterId
			) {
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
		} else {
			storage.setSession('menuPath', '/serviceList/mysql/MySQL');
			history.push({
				pathname: `/serviceList/mysql/MySQL/basicInfo/${
					(data as middlewareDetailProps).name
				}/${(data as middlewareDetailProps).mysqlDTO.type || 'mysql'}/${
					(data as middlewareDetailProps).chartVersion
				}/${data?.namespace}`
			});
		}
	};
	const toSourceDetail = () => {
		// * 源示例和备服务在用一个集群时
		if (
			(data as middlewareDetailProps).mysqlDTO.relationClusterId ===
			basicData?.clusterId
		) {
			storage.setSession('menuPath', '/serviceList/mysql/MySQL');
			history.push({
				pathname: `/serviceList/mysql/MySQL/basicInfo/${
					(data as middlewareDetailProps).name
				}/${(data as middlewareDetailProps).mysqlDTO.type || 'mysql'}/${
					(data as middlewareDetailProps).chartVersion
				}/${data?.namespace}`,
				state: {
					flag: true
				}
			});
		} else {
			// across the cluster
			const flag = storage.getLocal('firstAlert');
			if (flag === 0) {
				setVisible(true);
			} else {
				const cs = globalClusterList.filter(
					(item) =>
						item.id ===
						(data as middlewareDetailProps).mysqlDTO
							.relationClusterId
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
								(item: clusterType) =>
									item.name ===
									(data as middlewareDetailProps).mysqlDTO
										.relationNamespace
							);
							setNamespace(ns[0]);
							storage.setLocal(
								'namespace',
								JSON.stringify(ns[0])
							);
							setRefreshCluster(true);
							storage.setSession(
								'menuPath',
								'/serviceList/mysql/MySQL'
							);
							history.push({
								pathname: `/serviceList/mysql/MySQL/basicInfo/${
									(data as middlewareDetailProps).name
								}/${
									(data as middlewareDetailProps).mysqlDTO
										.type || 'mysql'
								}/${
									(data as middlewareDetailProps).chartVersion
								}/${data?.namespace}`,
								state: {
									flag: true
								}
							});
						}
					}
				});
			}
		}
	};
	const NotSupport = () => (
		<h3 style={{ textAlign: 'center' }}>
			该中间件类型不支持该功能，请选择mysql类型的中间件
		</h3>
	);
	const NotAuth = () => {
		setData(undefined);
		setIsService(true);
		return <h3 style={{ textAlign: 'center' }}>当前用户无该操作权限！</h3>;
	};
	return (
		<SecondLayout
			title="灾备中心"
			subTitle="为保障中间件服务高可用性，可跨集群创建备用服务，随时接手主服务的数据流量"
			hasBackArrow={true}
			onChange={onChange}
		>
			{basicData?.type !== 'mysql' && isService && operateFlag && (
				<NotSupport />
			)}
			{basicData?.type === 'mysql' &&
				isService &&
				operateFlag &&
				JSON.stringify(data) !== '{}' && (
					<Disaster
						chartName={basicData?.type || ''}
						chartVersion={data?.chartVersion || ''}
						middlewareName={basicData?.name || ''}
						clusterId={basicData?.clusterId || ''}
						namespace={basicData?.namespace || ''}
						data={data}
						onRefresh={toSourceDetail}
						getData={getData}
						toDetail={toDetail}
					/>
				)}
			{!isService && operateFlag && <NoService />}
			{!operateFlag && <NotAuth />}
			<SecondConfirm
				visible={visible}
				onCancel={() => setVisible(false)}
			/>
		</SecondLayout>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setCluster,
	setNamespace,
	setRefreshCluster
})(DisasterCenter);
