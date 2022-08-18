import React, { useEffect, useState } from 'react';
import { Button, notification } from 'antd';
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
	setMenuRefresh: (flag: boolean, clusterId: string) => void;
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
				setMenuRefresh(true, id);
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
