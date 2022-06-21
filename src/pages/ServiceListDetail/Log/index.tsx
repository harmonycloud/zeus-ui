import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { Tabs } from 'antd';
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
	const [selectedKey, setSelectedKey] = useState<string[]>(['realtime']);
	const menuSelect = (item: any) => {
		setSelectedKey(item.keyPath);
	};
	useEffect(() => {
		setSelectedKey(['realtime']);
	}, [currentTab]);
	const ConsoleMenu = () => {
		const items = [
			{
				label: '实时日志',
				key: 'realtime'
			}
		];
		!customMid &&
			type !== 'postgresql' &&
			type !== 'zookeeper' &&
			items.push({ label: '标准日志', key: 'standard' });
		!customMid &&
			type !== 'postgresql' &&
			type !== 'zookeeper' &&
			items.push({ label: '日志文件', key: 'file' });
		type === 'mysql' && items.push({ label: '慢日志查看', key: 'slow' });
		return (
			<ProMenu
				selectedKeys={selectedKey}
				onClick={menuSelect}
				style={{ height: '100%', marginLeft: 0 }}
				items={items}
			>
				{/* <ProMenu.Item key="realtime">实时日志</ProMenu.Item>
				{!customMid && (
					<ProMenu.Item key="standard">标准日志</ProMenu.Item>
				)}
				{!customMid && <ProMenu.Item key="file">日志文件</ProMenu.Item>}
				{type === 'mysql' && (
					<ProMenu.Item key="slow">慢日志查看</ProMenu.Item>
				)} */}
			</ProMenu>
		);
	};
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
				<Tabs>
					<Tabs.TabPane tab="实时日志" key="1">
						<RealtimeLog data={props} />
					</Tabs.TabPane>
					{!customMid ? (
						<Tabs.TabPane tab="标准日志" key="2">
							<StandardLog
								data={props}
								logging={logging}
								onRefresh={onRefresh}
							/>
						</Tabs.TabPane>
					) : null}
					{!customMid ? (
						<Tabs.TabPane tab="日志文件" key="3">
							<LogFile
								data={props}
								logging={logging}
								onRefresh={onRefresh}
							/>
						</Tabs.TabPane>
					) : null}
					{type === 'mysql' && (
						<Tabs.TabPane tab="慢日志查看" key="4">
							<SlowLog data={props} logging={logging} />
						</Tabs.TabPane>
					)}
				</Tabs>
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
