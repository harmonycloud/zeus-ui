import React, { useState } from 'react';
import { Tabs } from 'antd';
import KVMag from '../KVMag';
interface RedisDBMagProps {
	dbName: string;
}
export default function RedisDBMag(props: RedisDBMagProps): JSX.Element {
	const { dbName } = props;
	const [activeKey, setActiveKey] = useState<string>('kv');
	const onChange = (key: string) => setActiveKey(key);
	return (
		<Tabs
			className="redis-tab-content"
			activeKey={activeKey}
			onChange={onChange}
			items={[
				{
					label: 'k-v管理',
					key: 'kv',
					children: <KVMag dbName={dbName} />
				},
				{ label: '控制台', key: 'console', children: 'aaaaa' }
			]}
		/>
	);
}
