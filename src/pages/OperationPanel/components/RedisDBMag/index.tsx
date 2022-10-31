import React, { useState } from 'react';
import { Tabs } from 'antd';
import KVMag from '../KVMag';
export default function RedisDBMag(): JSX.Element {
	const [activeKey, setActiveKey] = useState<string>('kv');
	const onChange = (key: string) => setActiveKey(key);
	return (
		<Tabs
			className="redis-tab-content"
			activeKey={activeKey}
			onChange={onChange}
			items={[
				{ label: 'k-v管理', key: 'kv', children: <KVMag /> },
				{ label: '控制台', key: 'console', children: 'aaaaa' }
			]}
		/>
	);
}
