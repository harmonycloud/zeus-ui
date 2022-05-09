import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { Tab } from '@alicloud/console-components';
// import { Page, Content, Menu } from '@alicloud/console-components-page';
import { ProPage, ProContent, ProMenu } from '@/components/ProPage';

import DefaultPicture from '@/components/DefaultPicture';
import RealtimeLog from './realtimeLog';
import SlowLog from './slowLog';
import StandardLog from './standardLog';
import LogFile from './logFile';
import { DetailParams, LogProps } from '../detail';

export default function Log(props: LogProps): JSX.Element {
	const { type, data, customMid = false, logging, onRefresh } = props;
	const location = useLocation();
	const { pathname } = location;
	const params: DetailParams = useParams();
	const { currentTab } = params;
	const [selectedKey, setSelectedKey] = useState(['realtime']);
	const menuSelect = (item: any) => {
		setSelectedKey(item.keyPath);
	};
	useEffect(() => {
		setSelectedKey(['realtime']);
	}, [currentTab]);
	const ConsoleMenu = () => (
		<ProMenu
			selectedKeys={selectedKey}
			onClick={menuSelect}
			style={{ height: '100%', marginLeft: 0 }}
		>
			<ProMenu.Item key="realtime">实时日志</ProMenu.Item>
			{!customMid && <ProMenu.Item key="standard">标准日志</ProMenu.Item>}
			{!customMid && <ProMenu.Item key="file">日志文件</ProMenu.Item>}
			{type === 'mysql' && (
				<ProMenu.Item key="slow">慢日志查看</ProMenu.Item>
			)}
		</ProMenu>
	);
	const childrenRender = (selectedKey: string) => {
		switch (selectedKey) {
			case 'realtime':
				return <RealtimeLog data={props} />;
			case 'standard':
				return (
					<StandardLog
						data={props}
						logging={logging}
						onRefresh={onRefresh}
					/>
				);
			case 'file':
				return (
					<LogFile
						data={props}
						logging={logging}
						onRefresh={onRefresh}
					/>
				);
			case 'slow':
				return <SlowLog data={props} logging={logging} />;
			default:
				return null;
		}
	};
	if (customMid && !(data.capabilities || []).includes('log')) {
		return <DefaultPicture />;
	}
	if (pathname.includes('monitorAlarm')) {
		return (
			<div>
				<Tab>
					<Tab.Item title="实时日志">
						<RealtimeLog data={props} />
					</Tab.Item>
					{!customMid ? (
						<Tab.Item title="标准日志">
							<StandardLog
								data={props}
								logging={logging}
								onRefresh={onRefresh}
							/>
						</Tab.Item>
					) : null}
					{!customMid ? (
						<Tab.Item title="日志文件">
							<LogFile
								data={props}
								logging={logging}
								onRefresh={onRefresh}
							/>
						</Tab.Item>
					) : null}
					{type === 'mysql' && (
						<Tab.Item title="慢日志查看">
							<SlowLog data={props} logging={logging} />
						</Tab.Item>
					)}
				</Tab>
			</div>
		);
	} else {
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
}
