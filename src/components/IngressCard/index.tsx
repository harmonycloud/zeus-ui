import React, { useState } from 'react';
import { Dialog, Message } from '@alicloud/console-components';
import MidCard from '../MidCard';
import InstallIngressForm from './InstallIngress';
import AccessIngressForm from './AccessIngress';
import { deleteIngress } from '@/services/common';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import messageConfig from '../messageConfig';

interface IngressCardProps {
	status: number;
	title?: string;
	onRefresh: () => void;
	clusterId: string;
	data?: IngressItemProps;
}
const IngressCard = (props: IngressCardProps) => {
	const { status, title, onRefresh, clusterId, data } = props;
	const [installVisible, setInstallVisible] = useState<boolean>(false);
	const [accessVisible, setAccessVisible] = useState<boolean>(false);

	const uninstallComponent = () => {
		Dialog.show({
			title: '操作确认',
			content: '确认是否删除该服务暴露',
			onOk: () => {
				deleteIngress({
					clusterId,
					ingressName: data?.ingressClassName
				}).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'该服务暴露删除成功'
							)
						);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
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
						actionCount={2}
						leftHandle={() => setInstallVisible(true)}
						rightHandle={() => setAccessVisible(true)}
						status={-1}
						addTitle="新增负载均衡"
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
						leftHandle={() => setInstallVisible(false)}
						rightHandle={() => setAccessVisible(false)}
						titleStyle={{ fontSize: '12px' }}
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
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						titleStyle={{ fontSize: '12px' }}
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
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						titleStyle={{ fontSize: '12px' }}
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
						rightText="编辑"
						leftHandle={uninstallComponent}
						rightHandle={() => setAccessVisible(true)}
						titleStyle={{ fontSize: '12px' }}
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
		</>
	);
};
export default IngressCard;
