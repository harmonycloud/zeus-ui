import React, { useState } from 'react';
import { Tab } from '@alicloud/console-components';
import { useLocation } from 'react-router';
import { Page, Content } from '@alicloud/console-components-page';
import DefaultPicture from '@/components/DefaultPicture';
import RealtimeLog from './realtimeLog';
import SlowLog from './slowLog';
import StandardLog from './standardLog';
import LogFile from './logFile';

const { Menu } = Page;
export default function Log(props) {
	const { type, data, customMid = false } = props;
	const location = useLocation();
	const { pathname } = location;
	const [selectedKey, setSelectedKey] = useState('realtime');
	const menuSelect = (selectedKey) => {
		setSelectedKey(selectedKey);
	};
	const ConsoleMenu = () => (
		<Menu
			selectedKeys={selectedKey}
			onItemClick={menuSelect}
			style={{ height: '100%' }}
		>
			<Menu.Item key="realtime">实时日志</Menu.Item>
			{!customMid && <Menu.Item key="standard">标准日志</Menu.Item>}
			{!customMid && <Menu.Item key="file">日志文件</Menu.Item>}
			{type === 'mysql' && <Menu.Item key="slow">慢日志查看</Menu.Item>}
		</Menu>
	);
	const childrenRender = (selectedKey) => {
		switch (selectedKey) {
			case 'realtime':
				return <RealtimeLog data={props} />;
			case 'standard':
				return <StandardLog data={props} />;
			case 'file':
				return <LogFile data={props} />;
			case 'slow':
				return <SlowLog data={props} />;
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
							<StandardLog data={props} />
						</Tab.Item>
					) : null}
					{!customMid ? (
						<Tab.Item title="日志文件">
							<LogFile data={props} />
						</Tab.Item>
					) : null}
					{type === 'mysql' && (
						<Tab.Item title="慢日志查看">
							<SlowLog data={props} />
						</Tab.Item>
					)}
				</Tab>
			</div>
		);
	} else {
		return (
			<Page>
				<Content menu={<ConsoleMenu />} style={{ margin: 0 }}>
					{childrenRender(selectedKey)}
				</Content>
			</Page>
		);
	}
}
