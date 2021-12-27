import React, { Component, useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import AlarmRecord from './alarmRecord';
import AlarmSet from './alarmSet';
import ServerAlarm from '@/pages/InstanceList/Detail/ServeAlarm';
import './index.scss';
import { connect } from 'react-redux';
import storage from '@/utils/storage';

const { Menu } = Page;
function SystemAlarm(props) {
	const [selectedKey, setSelectedKey] = useState();
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const backKey = storage.getLocal('backKey');
	const menuSelect = (selectedKeys) => {
		setSelectedKey(selectedKeys[0]);
	};

	const TabMenu = ({ selected, handleMenu }) => (
		<Menu
			id="mid-menu"
			selectedKeys={selected}
			onSelect={handleMenu}
			direction="hoz"
		>
			<Menu.Item key="alarmRecord">系统告警记录</Menu.Item>
			<Menu.Item key="highAvailability">规则中心</Menu.Item>
			<Menu.Item key="externalAccess">告警设置</Menu.Item>
		</Menu>
	);

	const childrenRender = (key) => {
		switch (key) {
			case 'alarmRecord':
				return (
					<AlarmRecord
						alarmType={'system'}
						clusterId={globalCluster.id}
						monitor={globalCluster.monitor}
					/>
				);
			case 'highAvailability':
				return (
					<ServerAlarm
						alarmType={'system'}
						clusterId={globalCluster.id}
						monitor={globalCluster.monitor}
					/>
				);
			case 'externalAccess':
				return <AlarmSet />;
		}
	};

	useEffect(() => {
		backKey && backKey === 'highAvailability'
			? setSelectedKey('highAvailability')
			: setSelectedKey('alarmRecord');
	}, []);

	useEffect(() => {
		return () => storage.setLocal('backKey', '');
	}, []);

	return (
		<Page className="system-alarm">
			<Header title="系统告警" subTitle="系统相关告警展示及设置" />
			<div className="tab-menu">
				<TabMenu selected={selectedKey} handleMenu={menuSelect} />
			</div>
			<Content>{childrenRender(selectedKey)}</Content>
		</Page>
	);
}

export default connect(({ globalVar }) => ({ globalVar }), {})(SystemAlarm);
