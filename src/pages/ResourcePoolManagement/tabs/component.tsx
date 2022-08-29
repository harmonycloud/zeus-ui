import React, { useEffect, useState } from 'react';
import { Alert, Button, notification } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { getComponents } from '@/services/common';
import ComponentCard from '@/components/ComponentCard';
import BatchInstall from './batchInstall';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { setMenuRefresh } from '@/redux/menu/menu';
import { ComponentProp } from '../resource.pool';
import { paramsProps } from '../detail';

interface ComponentProps {
	setRefreshCluster: (flag: boolean) => void;
	setMenuRefresh: (flag: boolean) => void;
}

const Component = (props: ComponentProps) => {
	const { setRefreshCluster, setMenuRefresh } = props;
	const { id, nickname }: paramsProps = useParams();
	const [components, setComponents] = useState<ComponentProp[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
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
	return (
		<>
			{components.find(
				(item) => item.component === 'middleware-controller'
			)?.status !== 3 && (
				<Alert
					showIcon
					type="info"
					message="强烈建议安装中间件管理组件且运行正常，否则将无法使用平台大部分功能！"
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
		</>
	);
};
export default connect(() => ({}), {
	setRefreshCluster,
	setMenuRefresh
})(Component);
