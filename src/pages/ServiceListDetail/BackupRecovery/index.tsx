import React, { useEffect, useState } from 'react';
// import { Tab } from '@alicloud/console-components';
// import { Page, Content, Menu } from '@alicloud/console-components-page';
import { Tabs } from 'antd';
import { ProPage, ProContent, ProMenu } from '@/components/ProPage';
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
	const [selectedKey, setSelectedKey] = useState<any[]>(
		localStorage.getItem('backupTab')
			? [localStorage.getItem('backupTab')]
			: ['list']
	);
	const [customMid, setCustomMid] = useState<boolean>(false);
	const [capabilities, setCapabilities] = useState<string[]>([]);
	const { storage } = props;
	useEffect(() => {
		setCustomMid(props.customMid);
		setCapabilities(props.capabilities || []);
	}, [props]);
	useEffect(() => {
		const newLocal = 'list';
		currentTab &&
			currentTab !== 'backupRecovery' &&
			setSelectedKey([newLocal]);
	}, [currentTab]);
	useEffect(() => {
		localStorage.removeItem('backupTab');
	}, []);
	const menuSelect = (selectedKey: any) => {
		setSelectedKey([selectedKey.key]);
		localStorage.setItem('backupTab', selectedKey.key);
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
			<ProMenu
				selectedKeys={selectedKey}
				onClick={menuSelect}
				style={{ height: '100%', marginLeft: 0 }}
			>
				<ProMenu.Item key="list">备份记录</ProMenu.Item>
				<ProMenu.Item key="config">备份规则</ProMenu.Item>
			</ProMenu>
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
			<div>
				<Tabs>
					<Tabs.TabPane tab="备份记录" key="1">
						<List {...props} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="备份规则" key="2">
						<Config {...props} />
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	} else {
		return (
			<ProPage>
				<ProContent
					menu={<ConsoleMenu />}
					style={{ margin: 0, padding: 0 }}
				>
					{childrenRender(selectedKey[0])}
				</ProContent>
			</ProPage>
		);
	}
}
