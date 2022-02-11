import React, { useState, useEffect } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import ParamterList from './paramterList';
import ParamterHistory from './paramterHistory';
import ParamterTemplate from './paramterTemplate';
import ConfigMapEdit from './configMapEdit';
import DefaultPicture from '@/components/DefaultPicture';
import storage from '@/utils/storage';

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
	const [selectedKey, setSelectedKey] = useState(
		storage.getSession('paramsTab') || 'list'
	);
	const params = useParams();
	const { currentTab } = params;
	const menuSelect = (selectedKey) => {
		setSelectedKey(selectedKey);
		storage.setSession('paramsTab', selectedKey);
	};
	useEffect(() => {
		currentTab &&
			currentTab !== 'paramterSetting' &&
			setSelectedKey('list');
	}, [currentTab]);

	const ConsoleMenu = () => (
		<Menu
			selectedKeys={selectedKey}
			onItemClick={menuSelect}
			style={{ height: '100%' }}
		>
			<Menu.Item key="list">参数列表</Menu.Item>
			<Menu.Item key="config">参数修改历史</Menu.Item>
			<Menu.Item key="template">参数模板</Menu.Item>
			<Menu.Item key="configMap">ConfigMap编辑</Menu.Item>
		</Menu>
	);
	const childrenRender = (selectedKey) => {
		switch (selectedKey) {
			case 'list':
				return (
					<ParamterList
						clusterId={clusterId}
						middlewareName={middlewareName}
						namespace={namespace}
						type={type}
						onFreshChange={handleChange}
					/>
				);
			case 'config':
				return (
					<ParamterHistory
						clusterId={clusterId}
						middlewareName={middlewareName}
						namespace={namespace}
						type={type}
						refreshFlag={refreshFlag}
					/>
				);
			case 'template':
				return (
					<ParamterTemplate
						type={type}
						middlewareName={middlewareName}
						chartVersion={params.chartVersion}
					/>
				);
			case 'configMap':
				return (
					<ConfigMapEdit
						clusterId={clusterId}
						namespace={namespace}
					/>
				);
			default:
				return null;
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
			<Content menu={<ConsoleMenu />} style={{ margin: 0 }}>
				{childrenRender(selectedKey)}
			</Content>
		</Page>
	);
}
