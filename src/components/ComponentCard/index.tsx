import React, { useState } from 'react';
import { Icon, Message } from '@alicloud/console-components';
import { showConfirmDialog } from '@alicloud/console-components-confirm';
import { postComponent, deleteComponent } from '@/services/common';
import messageConfig from '../messageConfig';
import CustomIcon from '../CustomIcon';
import './index.scss';
import InstallForm from './installForm';
import AccessForm from './accessForm';

interface ComponentCardProps {
	title: string;
	status: number;
	clusterId: string;
	onRefresh: () => void;
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
const iconRender = (status: number) => {
	switch (status) {
		case 3:
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					运行正常
				</>
			);
		case 4:
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					运行异常
				</>
			);
		default:
			return null;
	}
};
const ComponentCard = (props: ComponentCardProps) => {
	const { title, status, clusterId, onRefresh } = props;
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
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			},
			onCancel: () => console.log('弹窗取消')
		});
	};
	return (
		<div className="component-card-content">
			<div className="component-card-display">
				<div
					className="component-card-icon"
					style={{ backgroundColor: color[title] }}
				>
					<CustomIcon
						type={icon[title]}
						style={{ color: '#FFFFFF', width: 40, fontSize: 40 }}
					/>
				</div>
				<div className="component-card-title">
					<div>{name[title]}</div>
					<div className="component-card-icon">
						{iconRender(status)}
					</div>
				</div>
			</div>
			{status === 0 && (
				<div className="component-card-action">
					<div
						className="component-card-install"
						style={
							title !== 'local-path' &&
							title !== 'middleware-controller'
								? {}
								: { width: '100%', borderRight: 'none' }
						}
						onClick={installComponent}
					>
						安装
					</div>
					{title !== 'local-path' &&
					title !== 'middleware-controller' ? (
						<div
							className="component-card-access"
							onClick={accessComponent}
						>
							接入
						</div>
					) : null}
				</div>
			)}
			{status === 1 && (
				<div className="component-card-action">
					<div
						className="component-card-uninstall"
						onClick={uninstallComponent}
					>
						取消接入
					</div>
					<div
						className="component-card-edit"
						onClick={() => setAccessVisible(true)}
					>
						编辑
					</div>
				</div>
			)}
			{status === 2 && (
				<div className="component-card-installing">
					<div>安装中</div>
				</div>
			)}
			{(status === 3 || status === 4) && (
				<div className="component-card-action">
					<div
						className={
							title !== 'local-path' &&
							title !== 'middleware-controller'
								? 'component-card-uninstall'
								: 'component-card-uninstall-one'
						}
						onClick={uninstallComponent}
					>
						卸载
					</div>
					{title !== 'local-path' &&
					title !== 'middleware-controller' ? (
						<div
							className="component-card-edit"
							onClick={() => setAccessVisible(true)}
						>
							编辑
						</div>
					) : null}
				</div>
			)}
			{status === 5 && (
				<div className="component-card-uninstalling">
					<div>卸载中</div>
				</div>
			)}
			{visible && (
				<InstallForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={installData}
					title={title}
					clusterId={clusterId}
				/>
			)}
			{accessVisible && (
				<AccessForm
					visible={accessVisible}
					onCancel={() => setAccessVisible(false)}
					title={title}
					clusterId={clusterId}
					onRefresh={onRefresh}
				/>
			)}
		</div>
	);
};
export default ComponentCard;
