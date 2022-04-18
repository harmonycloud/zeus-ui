import React, { useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
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
					<Tab.Item title="规则中心" key="alarm">
						<ServerAlarm
							alarmType={'system'}
							clusterId={globalCluster.id}
							monitor={globalCluster.monitor as monitorProps}
						/>
					</Tab.Item>
					<Tab.Item title="告警设置" key="alarmSet">
						<AlarmSet activeKey={activeKey} />
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(SystemAlarm);
