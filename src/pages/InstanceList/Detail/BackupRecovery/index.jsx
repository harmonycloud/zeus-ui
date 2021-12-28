import React, { useEffect, useState } from 'react';
import { Tab } from '@alicloud/console-components';
import { Page, Content } from '@alicloud/console-components-page';
import { useLocation } from 'react-router';
import List from './list';
import Config from './config';
import DefaultPicture from '@/components/DefaultPicture';
import ComponentNull from '@/components/ComponentsNull';
const { Menu } = Page;
export default function BackupRecovery(props) {
	const location = useLocation();
	const { pathname } = location;
	const [selectedKey, setSelectedKey] = useState('list');
	const [customMid, setCustomMid] = useState(false);
	const [capabilities, setCapabilities] = useState([]);
	const { storage } = props;
	useEffect(() => {
		setCustomMid(props.customMid);
		setCapabilities(props.capabilities || []);
		localStorage.getItem('backKey') &&
		localStorage.getItem('backKey').indexOf('config') !== -1
			? setSelectedKey('config')
			: setSelectedKey('list');
	}, [props]);
	useEffect(() => {
		return () => localStorage.setItem('backKey', '');
	}, []);
	const menuSelect = (selectedKey) => {
		setSelectedKey(selectedKey);
	};
	const childrenRender = (selected) => {
		if (selected === 'list') {
			return <List {...props} />;
		} else {
			return <Config {...props} />;
		}
	};
	const ConsoleMenu = () => {
		return (
			<Menu
				selectedKeys={selectedKey}
				onItemClick={menuSelect}
				style={{ height: '100%' }}
			>
				<Menu.Item key="list">备份记录</Menu.Item>
				<Menu.Item key="config">备份规则</Menu.Item>
			</Menu>
		);
	};
	if (
		!storage.backup ||
		!storage.backup.storage ||
		!storage.support ||
		!storage.support['CSI-LVM']
	) {
		return (
			<ComponentNull title="该功能所需要备份存储工具支持，您可前往“资源池——>平台组件进行安装" />
		);
	}
	if (customMid && !capabilities.includes('backup')) {
		return <DefaultPicture />;
	}
	if (pathname.includes('disasterBackup')) {
		return (
			<div>
				<Tab defaultActiveKey={selectedKey === 'list' ? 0 : 1}>
					<Tab.Item title="备份记录">
						<List {...props} />
					</Tab.Item>
					<Tab.Item title="备份规则">
						<Config {...props} />
					</Tab.Item>
				</Tab>
			</div>
		);
	} else {
		return (
			<Page>
				<Content menu={<ConsoleMenu />} style={{ margin: 0 }}>
					{childrenRender(selectedKey)}
				</Content>
			</Page>
		);
	}
}
