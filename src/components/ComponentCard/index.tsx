import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import { showConfirmDialog } from '@alicloud/console-components-confirm';
import { connect } from 'react-redux';
import { postComponent, deleteComponent } from '@/services/common';
import messageConfig from '../messageConfig';
import './index.scss';
import InstallForm from './installForm';
import AccessForm from './accessForm';
import { setRefreshCluster } from '@/redux/globalVar/var';
import MidCard from '../MidCard';

interface ComponentCardProps {
	title: string;
	status: number;
	clusterId: string;
	onRefresh: () => void;
	setRefreshCluster: (flag: boolean) => void;
}
export interface SendDataProps {
	clusterId: string;
	componentName: string;
	type: string;
}
export enum name {
	alertmanager = '监控告警',
	prometheus = '数据监控',
	logging = '日志采集',
	minio = '备份存储',
	grafana = '监控面板',
	ingress = '负载均衡',
	'local-path' = '资源存储',
	'middleware-controller' = '中间件管理'
}
export enum color {
	alertmanager = '#12C1C6',
	prometheus = '#F7786C',
	logging = '#6069FF',
	minio = '#846CF7',
	grafana = '#60C1FF',
	ingress = '#FFAA3A',
	'local-path' = '#E871AF',
	'middleware-controller' = '#C5D869'
}
export enum icon {
	alertmanager = 'icon-gaojingshijian1',
	prometheus = 'icon-shujujiankong1',
	logging = 'icon-rizhicaiji',
	minio = 'icon-beifen',
	grafana = 'icon-shujujiankong',
	ingress = 'icon-fuzaijunheng',
	'local-path' = 'icon-ziyuan-cunchu',
	'middleware-controller' = 'icon-zhongjianjianguanli'
}

const ComponentCard = (props: ComponentCardProps) => {
	const { title, status, clusterId, onRefresh, setRefreshCluster } = props;
	const [visible, setVisible] = useState<boolean>(false);
	const [accessVisible, setAccessVisible] = useState<boolean>(false);
	const installData = (data: SendDataProps) => {
		postComponent(data).then((res) => {
			if (res.success) {
				Message.show(messageConfig('success', '成功', '组件安装成功'));
				onRefresh();
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const installComponent = () => {
		if (title === 'local-path' || title === 'ingress') {
			const content =
				title === 'local-path' ? (
					<p>是否确认安装资源存储组件</p>
				) : (
					<p>是否确认安装负载均衡组件</p>
				);
			showConfirmDialog({
				type: 'notice',
				title: '确认安装',
				content: content,
				onConfirm: () => {
					const sendData = {
						clusterId,
						componentName: title,
						type: 'simple'
					};
					installData(sendData);
					setRefreshCluster(true);
				},
				onCancel: () => console.log('弹窗取消')
			});
		} else {
			setVisible(true);
		}
	};
	const accessComponent = () => {
		setAccessVisible(true);
	};
	const uninstallComponent = () => {
		const msg = status === 1 ? '取消接入' : '卸载';
		const content =
			status === 1 ? (
				<p>是否确认取消接入该组件</p>
			) : (
				<p>是否确认卸载该组件</p>
			);
		showConfirmDialog({
			type: 'error',
			title: `确认${msg}`,
			content: content,
			onConfirm: () => {
				const sendData = {
					clusterId,
					componentName: title,
					status
				};
				deleteComponent(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', `组件${msg}成功`)
						);
						onRefresh();
						setRefreshCluster(true);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			},
			onCancel: () => console.log('弹窗取消')
		});
	};
	const cardRender = () => {
		switch (status) {
			case 0:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={
							title !== 'local-path' &&
							title !== 'middleware-controller'
								? 2
								: 1
						}
						leftText="安装"
						rightText="接入"
						leftHandle={installComponent}
						rightHandle={accessComponent}
						centerText="安装"
						centerHandle={installComponent}
					/>
				);
			case 1:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={2}
						leftText="取消接入"
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
					/>
				);
			case 2:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={1}
						centerText="安装中"
						centerStyle={{
							background: '#0064C8',
							color: '#ffffff',
							border: 'none'
						}}
					/>
				);
			case 3:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={
							title !== 'local-path' &&
							title !== 'middleware-controller'
								? 2
								: 1
						}
						leftText="卸载"
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						centerText="卸载"
						centerHandle={uninstallComponent}
					/>
				);
			case 4:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={2}
						leftText="卸载"
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
					/>
				);
			case 5:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={1}
						centerText="卸载中"
						centerStyle={{
							background: '#C80000',
							color: '#ffffff',
							border: 'none'
						}}
					/>
				);
			default:
				break;
		}
	};
	return (
		<>
			{cardRender()}
			{visible && (
				<InstallForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={installData}
					title={title}
					clusterId={clusterId}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
			{accessVisible && (
				<AccessForm
					visible={accessVisible}
					onCancel={() => setAccessVisible(false)}
					title={title}
					clusterId={clusterId}
					onRefresh={onRefresh}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
		</>
	);
};
export default connect(() => ({}), {
	setRefreshCluster
})(ComponentCard);
