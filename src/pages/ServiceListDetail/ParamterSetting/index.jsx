import React, { useState } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import ParamterList from './paramterList';
import ParamterHistory from './paramterHistory';
import DefaultPicture from '@/components/DefaultPicture';

const { Menu } = Page;
export default function ParamterSetting(props) {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities
	} = props;
	const [refreshFlag, setRefreshFlag] = useState(false);
	const [selectedKey, setSelectedKey] = useState('list');
	const menuSelect = (selectedKey) => {
		setSelectedKey(selectedKey);
	};
	const ConsoleMenu = () => (
		<Menu
			selectedKeys={selectedKey}
			onItemClick={menuSelect}
			style={{ height: '100%', marginLeft: 0 }}
		>
			<Menu.Item key="list">参数列表</Menu.Item>
			<Menu.Item key="config">参数修改历史</Menu.Item>
		</Menu>
	);
	const childrenRender = (selectedKey) => {
		if (selectedKey === 'list') {
			return (
				<ParamterList
					clusterId={clusterId}
					middlewareName={middlewareName}
					namespace={namespace}
					type={type}
					onFreshChange={handleChange}
				/>
			);
		} else {
			return (
				<ParamterHistory
					clusterId={clusterId}
					middlewareName={middlewareName}
					namespace={namespace}
					type={type}
					refreshFlag={refreshFlag}
				/>
			);
		}
	};
	const handleChange = () => {
		setRefreshFlag(!refreshFlag);
	};
	if (customMid && !(capabilities || []).includes('config')) {
		return <DefaultPicture />;
	}
	return (
		<Page>
			<Content menu={<ConsoleMenu />} style={{ margin: 0, padding: 0 }}>
				{childrenRender(selectedKey)}
			</Content>
		</Page>
	);
}
