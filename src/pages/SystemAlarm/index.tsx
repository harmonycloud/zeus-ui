import React, { useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { Tabs } from 'antd';
import { Tab } from '@alicloud/console-components';

import AlarmRecord from './alarmRecord';
import GuidePage from '../GuidePage';
import AlarmSet from './alarmSet';
import ServerAlarm from '@/pages/ServiceListDetail/ServeAlarm';

import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { StoreState } from '@/types';
import { systemAlarmProps } from './systemAlarm';

import './index.scss';
import { monitorProps } from '@/types/comment';

function SystemAlarm(props: systemAlarmProps) {
	const [activeKey, setActiveKey] = useState(
		storage.getLocal('systemTab') || 'alarmRecord'
	);
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const onChange = (key: string | number) => {
		setActiveKey(key);
		storage.setLocal('systemTab', key);
	};

	useEffect(() => {
		return () => storage.removeLocal('systemTab');
	}, []);
	if (
		JSON.stringify(globalCluster) === '{}' &&
		JSON.stringify(globalNamespace) === '{}'
	) {
		return <GuidePage />;
	}
	return (
		<ProPage className="system-alarm">
			<ProHeader title="系统告警" subTitle="系统相关告警展示及设置" />
			<ProContent>
				<Tabs id="mid-menu" activeKey={activeKey} onChange={onChange}>
					<Tabs.TabPane tab="系统告警记录" key="alarmRecord">
						<AlarmRecord
							alarmType={'system'}
							clusterId={globalCluster.id}
							monitor={globalCluster.monitor}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="规则中心" key="alarm">
						<ServerAlarm
							alarmType={'system'}
							clusterId={globalCluster.id}
							monitor={globalCluster.monitor as monitorProps}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="告警设置" key="alarmSet">
						<AlarmSet activeKey={activeKey} />
					</Tabs.TabPane>
				</Tabs>
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(SystemAlarm);
