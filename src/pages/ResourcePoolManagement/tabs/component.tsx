import React, { useEffect, useState } from 'react';
import { Button, Message } from '@alicloud/console-components';
import { Page, Content } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import { paramsProps } from '../detail';
import { getComponents } from '@/services/common';
import { ComponentProp } from '../resource.pool';
import messageConfig from '@/components/messageConfig';
import ComponentCard from '@/components/ComponentCard';
import BatchInstall from './batchInstall';

const Component = () => {
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
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	return (
		<Page>
			<Content>
				<Button type="primary" onClick={() => setVisible(true)}>
					批量安装
				</Button>
				<div className="component-plugging-content">
					{components.map((item) => {
						return (
							<ComponentCard
								key={item.component}
								title={item.component}
								status={item.status}
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
				/>
			)}
		</Page>
	);
};
export default Component;
