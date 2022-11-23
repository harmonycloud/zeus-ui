import React, { useState } from 'react';
import { Tabs } from 'antd';
import KVMag from '../KVMag';
import RedisConsole from '../RedisConsole';
interface RedisDBMagProps {
	dbName: string;
	redisDbRefresh: () => void;
}
export default function RedisDBMag(props: RedisDBMagProps): JSX.Element {
	const { dbName, redisDbRefresh } = props;
	const [activeKey, setActiveKey] = useState<string>('kv');
	const onChange = (key: string) => setActiveKey(key);
	return (
		<Tabs
			className="redis-tab-content"
			activeKey={activeKey}
			onChange={onChange}
			items={[
				{
					label: 'K-V管理',
					key: 'kv',
					children: (
						<KVMag
							dbName={dbName}
							redisDbRefresh={redisDbRefresh}
						/>
					)
				},
				{
					label: '控制台',
					key: 'console',
					children: <RedisConsole dbName={dbName} />
				}
			]}
		/>
	);
}
