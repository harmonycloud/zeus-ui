import React from 'react';
import { Button } from '@alicloud/console-components';
import { Page, Content } from '@alicloud/console-components-page';

const Component = () => {
	return (
		<Page>
			<Content>
				<Button type="primary">批量安装</Button>
				<div className="component-plugging-content">aaa</div>
			</Content>
		</Page>
	);
};
export default Component;
