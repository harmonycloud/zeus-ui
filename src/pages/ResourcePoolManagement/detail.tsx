import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Tabs } from 'antd';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Overview from './tabs/overview';
import Namespace from './tabs/namespace';
import Component from './tabs/component';
import Ingress from './tabs/ingress';
import MirrorWarehouse from './tabs/mirrorWarehouse';
import storage from '@/utils/storage';

import './index.scss';

export interface paramsProps {
	id: string;
	nickname: string;
}
const { TabPane } = Tabs;
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
		<ProPage>
			<ProHeader title={nickname} onBack={() => window.history.back()} />
			<ProContent>
				<Tabs activeKey={activeKey} onChange={onChange}>
					<TabPane tab="概览" key="overview">
						<Overview />
					</TabPane>
					<TabPane tab="命名空间" key="namespace">
						<Namespace />
					</TabPane>
					<TabPane tab="负载均衡" key="ingress">
						<Ingress />
					</TabPane>
					<TabPane tab="镜像仓库" key="mirror">
						<MirrorWarehouse />
					</TabPane>
					<TabPane tab="平台组件" key="component">
						<Component />
					</TabPane>
				</Tabs>
			</ProContent>
		</ProPage>
	);
};

export default ResourcePoolDetail;
