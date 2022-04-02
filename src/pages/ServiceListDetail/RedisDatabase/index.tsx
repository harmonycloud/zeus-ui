import React, { useState, useEffect } from 'react';
import { Page, Content, Menu } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import DefaultPicture from '@/components/DefaultPicture';
import storage from '@/utils/storage';
import { DetailParams } from '../detail';
import KvManage from './kvManage';
import './index.scss';

export default function DataBase(props: any): JSX.Element {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities
	} = props;
	const [refreshFlag, setRefreshFlag] = useState(false);
	const [selectedKey, setSelectedKey] = useState(
		storage.getSession('paramsTab') || 'kvManage'
	);
	const params: DetailParams = useParams();
	const { currentTab, chartVersion } = params;
	const menuSelect = (selectedKey: string) => {
		setSelectedKey(selectedKey);
		storage.setSession('paramsTab', selectedKey);
	};
	useEffect(() => {
		currentTab && currentTab !== 'kvManage' && setSelectedKey('kvManage');
	}, [currentTab]);

	const ConsoleMenu = () => (
		<Menu
			selectedKeys={selectedKey}
			onItemClick={menuSelect}
			style={{ height: '100%' }}
		>
			<Menu.Item key="kvManage">kv管理</Menu.Item>
		</Menu>
	);
	const childrenRender = (selectedKey: string) => {
		switch (selectedKey) {
			case 'kvManage':
				return (
					<KvManage
						clusterId={clusterId}
						namespace={namespace}
						middlewareName={middlewareName}
					/>
				);
			default:
				return null;
		}
	};
	if (customMid && !(capabilities || []).includes('config')) {
		return <DefaultPicture />;
	}
	return (
		<Page>
			<Content menu={<ConsoleMenu />} style={{ margin: 0 }}>
				{childrenRender(selectedKey)}
			</Content>
		</Page>
	);
}
