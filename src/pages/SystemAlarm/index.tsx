import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { Tabs, Alert, Button, notification } from 'antd';

import AlarmRecord from './alarmRecord';
import GuidePage from '../GuidePage';
import AlarmSet from './alarmSet';
import ServerAlarm from '@/pages/ServiceListDetail/ServeAlarm';

import { connect } from 'react-redux';
import { getClusters, getComponents } from '@/services/common';
import storage from '@/utils/storage';
import { StoreState } from '@/types';
import { systemAlarmProps } from './systemAlarm';

import './index.scss';
import { monitorProps } from '@/types/comment';

function SystemAlarm(props: systemAlarmProps) {
	const [activeKey, setActiveKey] = useState(
		storage.getLocal('systemTab') || 'alarmRecord'
	);
	const history = useHistory();
	const [utilClusters, setUtilClusters] = useState<any[]>([]);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const onChange = (key: string | number) => {
		setActiveKey(key);
		storage.setLocal('systemTab', key);
	};
	useEffect(() => {
		getComponents({ clusterId: globalCluster.id }).then((res) => {
			if (res.success) {
				const alertTemp = res.data.find(
					(item: any) => item.component === 'alertmanager'
				).status;
				switch (alertTemp) {
					case 1:
						setAlertOpen(true);
						break;
					case 3:
						setAlertOpen(true);
						break;
					case 4:
						setAlertOpen(true);
						break;
					default:
						setAlertOpen(false);
						break;
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		getClusters().then((res) => {
			if (!res.data) return;
			setUtilClusters(
				res.data.map(
					(item: any) =>
						!item.monitor?.alertManager && {
							id: item.id,
							nickname: item.nickname
						}
				)
			);
		});
	}, []);

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
			{utilClusters.filter((item) => item).length ? (
				<Alert
					message={
						<div>
							集群
							{utilClusters
								.filter((item) => item)
								.map((item) => item.nickname)
								.join(',')}
							尚且未安装告警组件，将无法正常告警！
							{utilClusters
								.filter((item) => item)
								.map((item) => item.nickname)}
							<Button
								type="link"
								style={{
									height: 20,
									padding: 0
								}}
								onClick={() => {
									storage.setSession(
										'cluster-detail-current-tab',
										'component'
									);
									history.push(
										`/systemManagement/resourcePoolManagement/resourcePoolDetail/${
											utilClusters.filter(
												(item) => item
											)[0].id
										}/${
											utilClusters.filter(
												(item) => item
											)[0].nickname
										}`
									);
								}}
							>
								立即安装
							</Button>
						</div>
					}
					type="warning"
					showIcon
					closable
					style={{ margin: '0 24px' }}
				/>
			) : null}
			<ProContent>
				<Tabs id="mid-menu" activeKey={activeKey} onChange={onChange}>
					<Tabs.TabPane tab="系统告警记录" key="alarmRecord">
						<AlarmRecord
							alarmType={'system'}
							clusterId={globalCluster.id}
							alertOpen={alertOpen}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="规则中心" key="alarm">
						<ServerAlarm
							alarmType={'system'}
							clusterId={globalCluster.id}
							alertOpen={alertOpen}
						/>
					</Tabs.TabPane>
					{/* <Tabs.TabPane tab="告警设置" key="alarmSet">
						<AlarmSet activeKey={activeKey} />
					</Tabs.TabPane> */}
				</Tabs>
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(SystemAlarm);
