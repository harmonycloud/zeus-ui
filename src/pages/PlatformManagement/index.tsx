import React, { useState } from 'react';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { Tab } from '@alicloud/console-components';

import Personlization from './personalization';
import OpenCenter from './openCenter';

import './index.scss';


function PlatformManagement(): JSX.Element {
	const [activeKey, setActiveKey] = useState<string | number>('personlization');
	
	return (
		<Page className="platformManagement">
			<Header
				hasBackArrow
				renderBackArrow={(elem) => (
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
			<Content>
				<Tab activeKey={activeKey} onChange={value => setActiveKey(value)}>
					<Tab.Item title="个性化" key='personlization'>
						<Personlization activeKey={activeKey} />
					</Tab.Item>
					<Tab.Item title="开放中心" key='openCenter'>
						<OpenCenter activeKey={activeKey} />
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
}

export default PlatformManagement;
