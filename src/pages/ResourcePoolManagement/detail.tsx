import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { Tab } from '@alicloud/console-components';
import Overview from './tabs/overview';
import Namespace from './tabs/namespace';
import Component from './tabs/component';
import Ingress from './tabs/ingress';
import storage from '@/utils/storage';

export interface paramsProps {
	id: string;
	nickname: string;
}
const ResourcePoolDetail = () => {
	const [activeKey, setActiveKey] = useState<string>(
		storage.getLocal('cluster-detail-current-tab') === ''
			? 'overview'
			: storage.getLocal('cluster-detail-current-tab')
	);
	const params: paramsProps = useParams();
	const { nickname } = params;
	const onChange = (key: string | number) => {
		setActiveKey(key as string);
		storage.setLocal('cluster-detail-current-tab', key);
	};

	useEffect(() => {
		return storage.setLocal('cluster-detail-current-tab', '');
	});

	return (
		<Page>
			<Header
				title={`资源分区(${nickname})`}
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Tab activeKey={activeKey} onChange={onChange}>
					<Tab.Item title="概览" key="overview">
						<Overview />
					</Tab.Item>
					<Tab.Item title="资源分区" key="namespace">
						<Namespace />
					</Tab.Item>
					<Tab.Item title="负载均衡" key="ingress">
						<Ingress />
					</Tab.Item>
					<Tab.Item title="平台组件" key="component">
						<Component />
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
};

export default ResourcePoolDetail;
