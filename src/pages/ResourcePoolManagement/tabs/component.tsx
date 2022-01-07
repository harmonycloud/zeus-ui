import React, { useEffect, useState } from 'react';
import { Button, Message, Icon } from '@alicloud/console-components';
import { Page, Content } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import { paramsProps } from '../detail';
import { getComponents } from '@/services/common';
import { ComponentProp } from '../resource.pool';
import messageConfig from '@/components/messageConfig';
import ComponentCard from '@/components/ComponentCard';
import BatchInstall from './batchInstall';
import { connect } from 'react-redux';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { setMenuRefresh } from '@/redux/menu/menu';

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
				Message.show(messageConfig('error', '失败', res));
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
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	return (
		<Page>
			<Content>
				<div className="flex-space-between">
					<Button type="primary" onClick={() => setVisible(true)}>
						批量安装
					</Button>
					<Button onClick={getData}>
						<Icon type="refresh" />
					</Button>
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
			</Content>
			{visible && (
				<BatchInstall
					visible={visible}
					onCancel={() => setVisible(false)}
					components={components}
					clusterId={id}
					onRefresh={getData}
				/>
			)}
		</Page>
	);
};
export default connect(() => ({}), {
	setRefreshCluster,
	setMenuRefresh
})(Component);
