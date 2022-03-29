import React, { useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { Tab } from '@alicloud/console-components';
import Namespace from './namespace';
import Member from './member';

export default function ProjectDetail(): JSX.Element {
	const [activeKey, setActiveKey] = useState<string>('namespace');
	const onChange = (key: string | number) => {
		setActiveKey(key as string);
	};
	return (
		<Page>
			<Header
				title="项目详情"
				subTitle="管理用户自己的项目"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Tab activeKey={activeKey} onChange={onChange}>
					<Tab.Item title="命名空间" key="namespace">
						<Namespace />
					</Tab.Item>
					<Tab.Item title="成员管理" key="member">
						<Member />
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
}
