import React, { Component, useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { Tab } from '@alicloud/console-components';
import AlarmRecord from './alarmRecord';
import AlarmSet from './alarmSet';
import ServerAlarm from '@/pages/InstanceList/Detail/ServeAlarm';
import './index.scss';
import { connect } from 'react-redux';
import storage from '@/utils/storage';

const { Menu } = Page;
function SystemAlarm(props) {
	const [activeKey, setActiveKey] = useState(
		storage.getLocal('backKey') === ''
			? 'alarmRecord'
			: storage.getLocal('backKey')
	);
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const onChange = (key) => {
		setActiveKey(key);
		storage.setLocal('backKey', key);
	};

	useEffect(() => {
		return () => storage.setLocal('backKey', '');
	}, []);

	return (
		<Page className="system-alarm">
			<Header title="系统告警" subTitle="系统相关告警展示及设置" />
			<Content>
				<Tab id="mid-menu" activeKey={activeKey} onChange={onChange}>
					<Tab.Item title="系统告警记录" key="alarmRecord">
						<AlarmRecord
							alarmType={'system'}
							clusterId={globalCluster.id}
							monitor={globalCluster.monitor}
						/>
					</Tab.Item>
					<Tab.Item title="规则中心" key="highAvailability">
						<ServerAlarm
							alarmType={'system'}
							clusterId={globalCluster.id}
							monitor={globalCluster.monitor}
						/>
					</Tab.Item>
					<Tab.Item title="告警设置" key="externalAccess">
						<AlarmSet />
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
}

export default connect(({ globalVar }) => ({ globalVar }), {})(SystemAlarm);
