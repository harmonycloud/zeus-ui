import React, { useState } from 'react';
import { Tabs } from 'antd';
import TableInfo from '../TableInfo';
import ColInfo from '../ColInfo';
import IndexInfo from '../IndexInfo';
import ForeignKeyInfo from '../ForeignKeyInfo';
const items = [
	{ label: '基本信息', key: 'basicInfo', children: <TableInfo /> },
	{ label: '列信息', key: 'colInfo', children: <ColInfo /> },
	{ label: '索引信息', key: 'indexInfo', children: <IndexInfo /> },
	{ label: '外键信息', key: 'foreignKeyInfo', children: <ForeignKeyInfo /> }
];
export default function MysqlEditTable(): JSX.Element {
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const onChange = (key: string) => {
		setActiveKey(key);
	};
	return (
		<Tabs
			type="card"
			size="small"
			activeKey={activeKey}
			onChange={onChange}
			items={items}
		/>
	);
}
