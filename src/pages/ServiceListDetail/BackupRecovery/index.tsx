import React, { useEffect, useState } from 'react';
import { Tab } from '@alicloud/console-components';
import { Page, Content, Menu } from '@alicloud/console-components-page';
import { useLocation, useParams } from 'react-router';
import List from './list';
import Config from './config';
import DefaultPicture from '@/components/DefaultPicture';
import ComponentNull from '@/components/ComponentsNull';
import { BackupRecoveryProps, DetailParams } from '../detail';

export default function BackupRecovery(
	props: BackupRecoveryProps
): JSX.Element {
	const location = useLocation();
	const { pathname } = location;
	const params: DetailParams = useParams();
	const { currentTab } = params;
	const [selectedKey, setSelectedKey] = useState<string>(
		localStorage.getItem('backupTab') || 'list'
	);
	const [customMid, setCustomMid] = useState<boolean>(false);
	const [capabilities, setCapabilities] = useState<string[]>([]);
	const { storage } = props;
	useEffect(() => {
		setCustomMid(props.customMid);
		setCapabilities(props.capabilities || []);
	}, [props]);
	useEffect(() => {
		currentTab && currentTab !== 'backupRecovery' && setSelectedKey('list');
	}, [currentTab]);
	useEffect(() => {
		localStorage.removeItem('backupTab');
	}, []);
	const menuSelect = (selectedKey: string) => {
		setSelectedKey(selectedKey);
		localStorage.setItem('backupTab', selectedKey);
	};
	const childrenRender = (selected: string) => {
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
	if (storage) {
		if (!storage.backup || !storage.backup.storage) {
			return (
				<ComponentNull title="该功能所需要备份存储工具支持，您可前往“集群——>平台组件进行安装" />
			);
		}
	}

	if (customMid && !capabilities.includes('backup')) {
		return <DefaultPicture />;
	}
	if (pathname.includes('disasterBackup')) {
		return (
			<Tab defaultActiveKey={selectedKey === 'list' ? 0 : 1}>
				<Tab.Item title="备份记录">
					<List {...props} />
				</Tab.Item>
				<Tab.Item title="备份规则">
					<Config {...props} />
				</Tab.Item>
			</Tab>
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
