import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ProPage, ProContent, ProMenu } from '@/components/ProPage';
import ParamterList from './paramerListVersiontwo';
import ParamterHistory from './paramterHistory';
import ParamterTemplate from './paramterTemplate';
import ConfigMapEdit from './configMapEdit';
import DefaultPicture from '@/components/DefaultPicture';
import storage from '@/utils/storage';
import { ParamterSettingProps, DetailParams } from '../detail';
import { MenuInfo } from '@/types/comment';

export default function ParamterSetting(
	props: ParamterSettingProps
): JSX.Element {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities
	} = props;
	const [selectedKey, setSelectedKey] = useState<string[]>([
		storage.getSession('paramsTab') || 'list'
	]);
	const params: DetailParams = useParams();
	const { currentTab, chartVersion } = params;
	const menuSelect = (info: MenuInfo) => {
		setSelectedKey(info.keyPath);
		storage.setSession('paramsTab', info.key);
	};
	useEffect(() => {
		currentTab &&
			currentTab !== 'paramterSetting' &&
			setSelectedKey(['list']);
	}, [currentTab]);

	const ConsoleMenu = () => (
		<ProMenu
			selectedKeys={selectedKey}
			onClick={menuSelect}
			style={{ height: '100%' }}
			items={[
				{ label: '参数列表', key: 'list' },
				{ label: '参数模板', key: 'template' },
				{ label: '参数修改历史', key: 'config' },
				{ label: 'ConfigMap编辑', key: 'configMap' }
			]}
		/>
	);
	const childrenRender = (selectedKey: string) => {
		switch (selectedKey) {
			case 'list':
				return (
					<ParamterList
						clusterId={clusterId}
						middlewareName={middlewareName}
						namespace={namespace}
						type={type}
					/>
				);
			case 'config':
				return (
					<ParamterHistory
						clusterId={clusterId}
						middlewareName={middlewareName}
						namespace={namespace}
						type={type}
					/>
				);
			case 'template':
				return (
					<ParamterTemplate
						type={type}
						middlewareName={middlewareName}
						chartVersion={chartVersion}
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
	if (customMid && !(capabilities || []).includes('config')) {
		return <DefaultPicture />;
	}
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
