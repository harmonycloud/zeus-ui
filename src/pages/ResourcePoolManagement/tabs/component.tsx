import React, { useEffect, useState } from 'react';
import { Alert, Button, notification } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { getComponents, postComponent } from '@/services/common';
import ComponentCard, { SendDataProps } from '@/components/ComponentCard';
import BatchInstall from './batchInstall';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { setMenuRefresh } from '@/redux/menu/menu';
import { ComponentProp } from '../resource.pool';
import { paramsProps } from '../detail';
import InstallForm from '@/components/ComponentCard/installForm';

interface ComponentProps {
	setRefreshCluster: (flag: boolean) => void;
	setMenuRefresh: (flag: boolean) => void;
}

const Component = (props: ComponentProps) => {
	const { setRefreshCluster, setMenuRefresh } = props;
	const { id, nickname }: paramsProps = useParams();
	const [components, setComponents] = useState<ComponentProp[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [middlewareVidible, setMiddlewareVisible] = useState<boolean>(false);
	useEffect(() => {
		let mounted = true;
		getComponents({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
					setComponents(res.data);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	const getData = () => {
		getComponents({ clusterId: id }).then((res) => {
			if (res.success) {
				setComponents(res.data);
				setRefreshCluster(true);
				setMenuRefresh(true);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const installData = (data: SendDataProps) => {
		postComponent(data).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '组件安装成功'
				});
				getData();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<>
			{components.find(
				(item) => item.component === 'middleware-controller'
			)?.status !== 3 && (
				<Alert
					showIcon
					type="info"
					message={
						<span>
							中间件管理组件未安装或运行异常，请先安装或修复异常！
							<span
								className="name-link"
								onClick={() => setMiddlewareVisible(true)}
							>
								立即安装
							</span>
						</span>
					}
					style={{ marginBottom: 16 }}
				/>
			)}
			<div className="flex-space-between">
				<Button type="primary" onClick={() => setVisible(true)}>
					批量安装
				</Button>
				<Button
					type="default"
					icon={<ReloadOutlined />}
					onClick={getData}
				/>
			</div>
			<div className="component-plugging-content">
				{components.map((item) => {
					return (
						<ComponentCard
							key={item.component}
							title={item.component}
							status={item.status}
							createTime={item.createTime}
							seconds={item.seconds}
							clusterId={id}
							onRefresh={getData}
						/>
					);
				})}
			</div>
			{visible && (
				<BatchInstall
					visible={visible}
					onCancel={() => setVisible(false)}
					components={components}
					clusterId={id}
					onRefresh={getData}
				/>
			)}
			{middlewareVidible && (
				<InstallForm
					visible={middlewareVidible}
					onCancel={() => setMiddlewareVisible(false)}
					onCreate={installData}
					title={'middleware-controller'}
					clusterId={id}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
		</>
	);
};
export default connect(() => ({}), {
	setRefreshCluster,
	setMenuRefresh
})(Component);
