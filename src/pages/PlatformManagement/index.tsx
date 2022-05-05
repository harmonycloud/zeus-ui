import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';

import Personlization from './personalization';
import OpenCenter from './openCenter';

import './index.scss';

const { TabPane } = Tabs;
function PlatformManagement(): JSX.Element {
	const [activeKey, setActiveKey] = useState<string | undefined>(
		'personlization'
	);

	return (
		<ProPage className="platformManagement">
			<ProHeader
				onBack={(elem) => (
					<span
						className="details-go-back"
						onClick={() => window.history.back()}
					>
						{elem}
					</span>
				)}
				title="平台管理"
				subTitle="平台个性化以及能力拓展管理中心"
			/>
			<ProContent>
				<Tabs
					activeKey={activeKey}
					onChange={(value) => setActiveKey(value)}
				>
					<TabPane tab="个性化" key="personlization">
						<Personlization activeKey={activeKey} />
					</TabPane>
					<TabPane tab="开放中心" key="openCenter">
						<OpenCenter activeKey={activeKey} />
					</TabPane>
				</Tabs>
			</ProContent>
		</ProPage>
	);
}

export default PlatformManagement;
