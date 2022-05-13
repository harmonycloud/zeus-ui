import React, { useState, useEffect } from 'react';
import { ProPage, ProContent, ProMenu } from '@/components/ProPage';
import KvManage from './kvManage';

import { useParams } from 'react-router';
import DefaultPicture from '@/components/DefaultPicture';
import storage from '@/utils/storage';
import { DetailParams } from '../detail';
import './index.scss';

export default function DataBase(props: any): JSX.Element {
	const { middlewareName, clusterId, namespace, customMid, capabilities } =
		props;
	const [selectedKey, setSelectedKey] = useState<string[]>(
		[...storage.getSession('paramsTab')] || ['kvManage']
	);
	const params: DetailParams = useParams();
	const { currentTab } = params;
	const menuSelect = (selectedKey: any) => {
		setSelectedKey(selectedKey);
		storage.setSession('paramsTab', selectedKey);
	};
	useEffect(() => {
		currentTab && currentTab !== 'kvManage' && setSelectedKey(['kvManage']);
	}, [currentTab]);

	const ConsoleMenu = () => (
		<ProMenu
			selectedKeys={selectedKey}
			onClick={menuSelect}
			style={{ height: '100%' }}
			items={[
				{
					key: 'kvManage',
					label: 'K-V管理'
				}
			]}
		></ProMenu>
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
		<ProPage>
			<ProContent menu={<ConsoleMenu />} style={{ margin: 0 }}>
				{childrenRender(selectedKey[0])}
			</ProContent>
		</ProPage>
	);
}
