import React, { useState } from 'react';
import { notification, Modal } from 'antd';
import { connect } from 'react-redux';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { postComponent, deleteComponent } from '@/services/common';
import InstallForm from './installForm';
import AccessForm from './accessForm';
import LvmInstallForm from './lvmInstallForm';
import MidCard from '../MidCard';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { name, icon, color } from '@/utils/enum';
import './index.scss';

interface ComponentCardProps {
	title: string;
	status: number;
	clusterId: string;
	onRefresh: () => void;
	setRefreshCluster: (flag: boolean) => void;
	createTime: string | null;
	seconds: number;
	data: any;
}
export interface SendDataProps {
	clusterId: string;
	componentName: string;
	type?: string;
	vgName?: string;
	size?: number;
}

const { confirm } = Modal;

const ComponentCard = (props: ComponentCardProps) => {
	const {
		title,
		status,
		clusterId,
		onRefresh,
		setRefreshCluster,
		createTime,
		seconds,
		data
	} = props;
	const [visible, setVisible] = useState<boolean>(false);
	const [accessVisible, setAccessVisible] = useState<boolean>(false);
	const [lvmVisible, setLvmVisible] = useState<boolean>(false);
	const installData = (data: SendDataProps) => {
		postComponent(data).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '组件安装成功'
				});
				onRefresh();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
			confirm({
				title: '确认安装',
				content: content,
				okText: '确定',
				cancelText: '取消',
				onOk: () => {
					const sendData = {
						clusterId,
						componentName: title,
						type: 'simple'
					};
					installData(sendData);
					setRefreshCluster(true);
				}
			});
		} else {
			setVisible(true);
		}
	};
	const uninstallComponent = () => {
		const msg = status === 1 ? '取消接入' : '卸载';
		const content =
			status === 1 ? (
				<p>是否确认取消接入该组件</p>
			) : (
				<p>是否确认卸载该组件</p>
			);
		confirm({
			icon: <ExclamationCircleOutlined />,
			title: `确认${msg}`,
			content: content,
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				const sendData = {
					clusterId,
					componentName: title,
					status
				};
				deleteComponent(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: `组件${msg}操作成功`
						});
						onRefresh();
						setRefreshCluster(true);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			},
			onCancel: () => console.log('弹窗取消')
		});
	};
	const actionRender = (title: string) => {
		if (title !== 'lvm' && title !== 'local-path' && title !== 'minio') {
			return 2;
		} else {
			return 1;
		}
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
						actionCount={actionRender(title)}
						leftText="安装"
						rightText="接入"
						leftClass="link"
						rightClass="link"
						leftHandle={() => {
							title !== 'lvm'
								? installComponent()
								: setLvmVisible(true);
						}}
						rightHandle={() => setAccessVisible(true)}
						centerText="安装"
						centerClass="link"
						centerHandle={() => {
							title !== 'lvm'
								? installComponent()
								: setLvmVisible(true);
						}}
						createTime={createTime}
						seconds={seconds}
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
						leftClass="danger"
						rightClass="link"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						createTime={createTime}
						seconds={seconds}
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
						createTime={createTime}
						centerStyle={{
							background: '#0064C8',
							color: '#ffffff',
							border: 'none'
						}}
						onRefresh={onRefresh}
						seconds={seconds}
					/>
				);
			case 3:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={actionRender(title)}
						leftText="卸载"
						leftClass="danger"
						rightText="编辑"
						rightClass="link"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						centerText="卸载"
						centerClass="danger"
						centerHandle={uninstallComponent}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 4:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={actionRender(title)}
						leftText="卸载"
						leftClass="danger"
						rightClass="link"
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						centerText="卸载"
						centerClass="danger"
						centerHandle={uninstallComponent}
						createTime={createTime}
						seconds={seconds}
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
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 6:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={actionRender(title)}
						leftText="卸载"
						leftClass="danger"
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						centerText="卸载"
						centerClass="danger"
						centerHandle={uninstallComponent}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 7:
				return (
					<MidCard
						color={color[title]}
						icon={icon[title]}
						title={name[title]}
						status={status}
						actionCount={actionRender(title)}
						leftText="卸载"
						leftClass="danger"
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						centerText="卸载"
						centerClass="danger"
						centerHandle={uninstallComponent}
						createTime={createTime}
						seconds={seconds}
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
				/>
			)}
			{accessVisible && (
				<AccessForm
					visible={accessVisible}
					onCancel={() => setAccessVisible(false)}
					status={status}
					title={title}
					clusterId={clusterId}
					onRefresh={onRefresh}
					componentData={data}
				/>
			)}
			{lvmVisible && (
				<LvmInstallForm
					visible={lvmVisible}
					onCancel={() => setLvmVisible(false)}
					onCreate={installData}
					title={title}
					clusterId={clusterId}
					onRefresh={onRefresh}
				/>
			)}
		</>
	);
};
export default connect(() => ({}), {
	setRefreshCluster
})(ComponentCard);
