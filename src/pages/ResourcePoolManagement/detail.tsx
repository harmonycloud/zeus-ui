import React from 'react';
import { useParams } from 'react-router';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { Tab } from '@alicloud/console-components';
import Overview from './tabs/overview';

export interface paramsProps {
	id: string;
	nickname: string;
}
const ResourcePoolDetail = () => {
	const params: paramsProps = useParams();
	const { id, nickname } = params;
	return (
		<Page>
			<Header
				title={nickname}
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Tab>
					<Tab.Item title="概览">
						<Overview />
					</Tab.Item>
					<Tab.Item title="资源分区"></Tab.Item>
					<Tab.Item title="插拔工具"></Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
};

export default ResourcePoolDetail;
