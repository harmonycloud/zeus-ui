import React, { useState } from 'react';
import { Tabs } from 'antd';
import PgInherit from '../PgInherit';
import PgsqlTableInfo from '../PgsqlTableInfo';
import PgsqlColInfo from '../PgsqlColInfo';
import PgExamine from '../PgExamine';
import PgUniqueness from '../PgUniqueness';
import PgForeignKeyInfo from '../PgForeignKeyInfo';
const items = [
	{ label: '基本信息', key: 'basicInfo', children: <PgsqlTableInfo /> },
	{ label: '列信息', key: 'colInfo', children: <PgsqlColInfo /> },
	{
		label: '外键信息',
		key: 'foreignKeyInfo',
		children: <PgForeignKeyInfo />
	},
	{ label: '排他性约束', key: 'exclusiveness', children: <PgInherit /> },
	{ label: '唯一约束', key: 'uniqueness', children: <PgUniqueness /> },
	{ label: '检查约束', key: 'examine', children: <PgExamine /> },
	{ label: '继承', key: 'inherit', children: <PgInherit /> }
];
export default function PgsqlEditTable(): JSX.Element {
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
