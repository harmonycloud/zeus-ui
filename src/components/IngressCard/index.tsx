import React, { useState } from 'react';
import { Modal, notification } from 'antd';
import MidCard from '../MidCard';
import InstallIngressForm from './InstallIngress';
import AccessIngressForm from './AccessIngress';
import { deleteIngress } from '@/services/common';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import SelectedType from './selectedType';

interface IngressCardProps {
	status: number;
	title?: string;
	onRefresh: () => void;
	clusterId: string;
	data?: IngressItemProps;
	createTime: string | null;
	seconds: number;
}
const { confirm } = Modal;
const IngressCard = (props: IngressCardProps) => {
	const { status, title, onRefresh, clusterId, data, createTime, seconds } =
		props;
	const [installVisible, setInstallVisible] = useState<boolean>(false);
	const [accessVisible, setAccessVisible] = useState<boolean>(false);
	const [selectedVisible, setSelectedVisible] = useState<boolean>(false);
	const uninstallComponent = (type = 'install') => {
		confirm({
			title: '操作确认',
			content: `确认是否${
				type === 'install' ? '卸载' : '取消接入'
			}该服务暴露`,
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				deleteIngress({
					clusterId,
					ingressName: data?.ingressClassName
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: `该服务暴露${
								type === 'install' ? '卸载' : '取消接入'
							}成功`
						});
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};

	const childrenRender = () => {
		switch (status) {
			case -1:
				return (
					<MidCard
						leftText="安装"
						rightText="接入"
						leftClass="link"
						rightClass="link"
						actionCount={2}
						leftHandle={() => setSelectedVisible(true)}
						rightHandle={() => setSelectedVisible(true)}
						// leftHandle={() => setInstallVisible(true)}
						// rightHandle={() => setAccessVisible(true)}
						status={-1}
						addTitle="新增负载均衡"
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 0:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={2}
						leftText="安装"
						rightText="接入"
						leftClass="link"
						rightClass="link"
						leftHandle={() => setInstallVisible(false)}
						rightHandle={() => setAccessVisible(false)}
						titleStyle={{ fontSize: '12px' }}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 1:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={2}
						leftText="取消接入"
						leftClass="danger"
						rightText="编辑"
						rightClass="link"
						leftHandle={() => uninstallComponent('access')}
						rightHandle={() => setAccessVisible(true)}
						titleStyle={{ fontSize: '12px' }}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 2:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={1}
						centerText="安装中"
						centerStyle={{
							background: '#0064C8',
							color: '#ffffff',
							border: 'none'
						}}
						titleStyle={{ fontSize: '12px' }}
						createTime={createTime}
						onRefresh={onRefresh}
						seconds={seconds}
					/>
				);
			case 3:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={2}
						leftText="卸载"
						leftClass="danger"
						rightText="编辑"
						rightClass="link"
						leftHandle={() => uninstallComponent('install')}
						rightHandle={() => setAccessVisible(true)}
						titleStyle={{ fontSize: '12px' }}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 4:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={2}
						leftText="卸载"
						leftClass="danger"
						rightText="编辑"
						rightClass="link"
						leftHandle={() => uninstallComponent('install')}
						rightHandle={() => setAccessVisible(true)}
						titleStyle={{ fontSize: '12px' }}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 5:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={1}
						centerText="卸载中"
						centerStyle={{
							background: '#C80000',
							color: '#ffffff',
							border: 'none'
						}}
						titleStyle={{ fontSize: '12px' }}
						createTime={createTime}
						seconds={seconds}
					/>
				);
			case 6:
				return (
					<MidCard
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title={title}
						status={status}
						actionCount={1}
						centerText="卸载"
						centerClass="danger"
						centerHandle={() => uninstallComponent('install')}
						titleStyle={{ fontSize: '12px' }}
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
			{childrenRender()}
			{accessVisible && (
				<AccessIngressForm
					visible={accessVisible}
					onCancel={() => setAccessVisible(false)}
					onRefresh={onRefresh}
					clusterId={clusterId}
					data={data}
				/>
			)}
			{installVisible && (
				<InstallIngressForm
					visible={installVisible}
					onCancel={() => setInstallVisible(false)}
					onRefresh={onRefresh}
					clusterId={clusterId}
				/>
			)}
			{selectedVisible && (
				<SelectedType
					visible={selectedVisible}
					onCancel={() => setSelectedVisible(false)}
				/>
			)}
		</>
	);
};
export default IngressCard;
