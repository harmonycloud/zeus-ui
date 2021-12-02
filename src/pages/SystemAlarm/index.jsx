import React, { Component, useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import AlarmRecord from './alarmRecord';
import AlarmSet from './alarmSet';
import { Message } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import { getMiddlewareDetail } from '@/services/middleware';
import ServerAlarm from '@/pages/InstanceList/Detail/ServeAlarm';
import './index.scss';
import { connect } from 'react-redux';

const { Menu } = Page;
function SystemAlarm(props) {
	const [selectedKey, setSelectedKey] = useState();
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const menuSelect = (selectedKeys) => {
		setSelectedKey(selectedKeys[0]);
	};
	const [data, setData] = useState();
	const [basicData, setBasicData] = useState();
	const [isService, setIsService] = useState(false);

	const onChange = (name, type, namespace, cluster) => {
		if (name !== null) {
			setBasicData({
				name,
				type,
				clusterId: cluster.id,
				namespace,
				storage: cluster.storage
			});
			getMiddlewareDetail({
				clusterId: cluster.id,
				namespace,
				type,
				middlewareName: name
			}).then((res) => {
				if (res.success) {
					setIsService(true);
					setData(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		} else {
			setIsService(false);
		}
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
					/>
				);
			case 'highAvailability':
				return (
					<ServerAlarm
						alarmType={'system'}
						clusterId={globalCluster.id}
					/>
				);
			case 'externalAccess':
				return <AlarmSet />;
		}
	};

	useEffect(() => {
		console.log(props);
		setSelectedKey('alarmRecord');
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
