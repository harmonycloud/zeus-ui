import React, { useState } from 'react';
import { Button, Divider, Space, Tabs } from 'antd';
import PgInherit from '../PgInherit';
import PgsqlTableInfo from '../PgsqlTableInfo';
import PgsqlColInfo from '../PgsqlColInfo';
import PgExamine from '../PgExamine';
import PgUniqueness from '../PgUniqueness';
import PgForeignKeyInfo from '../PgForeignKeyInfo';
import { PgsqlEditTableProps } from '../../index.d';
import PgExclusiveness from '../PgExclusiveness';
export default function PgsqlEditTable(
	props: PgsqlEditTableProps
): JSX.Element {
	const { isEdit } = props;
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const [originData, setOriginData] = useState({
		info: {},
		colInfo: [
			{
				key: '1',
				columnName: 'ss',
				columnType: 'ss',
				isArray: false,
				nullable: true,
				primaryKey: false,
				default: 'ss',
				length: 's',
				description: 's',
				rule: 'ss'
			}
		],
		foreignKeyInfo: [],
		exclusiveness: [],
		uniqueness: [],
		examine: []
	});
	const onChange = (key: string) => {
		setActiveKey(key);
	};
	const infoChange = (values: any, dataIndex: string) => {
		setOriginData({
			...originData,
			[dataIndex]: values
		});
	};
	const childrenRender = (type: string) => {
		const componentRender = () => {
			switch (type) {
				case 'basicInfo':
					return (
						<PgsqlTableInfo
							isEdit={isEdit || false}
							handleChange={(values: any) =>
								infoChange(values, 'info')
							}
						/>
					);
				case 'colInfo':
					return (
						<PgsqlColInfo
							originData={originData.colInfo}
							handleChange={(values: any) =>
								infoChange(values, 'info')
							}
						/>
					);
				case 'foreignKeyInfo':
					return (
						<PgForeignKeyInfo
							originData={originData.foreignKeyInfo}
							handleChange={(values: any) =>
								infoChange(values, 'foreignKeyInfo')
							}
						/>
					);
				case 'exclusiveness':
					return (
						<PgExclusiveness
							originData={originData.exclusiveness}
							handleChange={(values: any) =>
								infoChange(values, 'exclusiveness')
							}
						/>
					);
				case 'uniqueness':
					return (
						<PgUniqueness
							originData={originData.uniqueness}
							handleChange={(values: any) =>
								infoChange(values, 'uniqueness')
							}
						/>
					);
				case 'examine':
					return (
						<PgExamine
							originData={originData.examine}
							handleChange={(values: any) =>
								infoChange(values, 'examine')
							}
						/>
					);
				case 'inherit':
					return (
						<PgInherit
							isEdit={isEdit || false}
							handleChange={(values: any) =>
								infoChange(values, 'inherit')
							}
						/>
					);
				default:
					break;
			}
		};
		return (
			<div>
				{componentRender()}
				<Divider />
				<Space>
					<Button type="primary">保存</Button>
					<Button>取消</Button>
				</Space>
			</div>
		);
	};
	const items = [
		{
			label: '基本信息',
			key: 'basicInfo',
			children: childrenRender('basicInfo')
		},
		{
			label: '列信息',
			key: 'colInfo',
			children: childrenRender('colInfo')
		},
		{
			label: '外键信息',
			key: 'foreignKeyInfo',
			children: childrenRender('foreignKeyInfo')
		},
		{
			label: '排他性约束',
			key: 'exclusiveness',
			children: childrenRender('exclusiveness')
		},
		{
			label: '唯一约束',
			key: 'uniqueness',
			children: childrenRender('uniqueness')
		},
		{
			label: '检查约束',
			key: 'examine',
			children: childrenRender('examine')
		},
		{ label: '继承', key: 'inherit', children: childrenRender('inherit') }
	];
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
