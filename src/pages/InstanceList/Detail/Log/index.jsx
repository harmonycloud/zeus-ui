import React from 'react';
import { Tab } from '@alicloud/console-components';
import DefaultPicture from '@/components/DefaultPicture';
import RealtimeLog from './realtimeLog';
import SlowLog from './slowLog';
import StandardLog from './standardLog';
import LogFile from './logFile';

export default function Log(props) {
	const { type, data, customMid = false } = props;
	if (customMid && !(data.capabilities || []).includes('log')) {
		return <DefaultPicture />;
	}
	return (
		<div>
			<Tab>
				<Tab.Item title="实时日志">
					<RealtimeLog data={props} />
				</Tab.Item>
				{/* {!customMid ? (
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
				)} */}
			</Tab>
		</div>
	);
}
