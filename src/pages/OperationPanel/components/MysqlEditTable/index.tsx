import React, { useState } from 'react';
import { Button, Divider, Space, Tabs } from 'antd';
import { MysqlEditTableProps } from '../../index.d';
import MysqlTableInfo from '../MysqlTableInfo';
import MysqlColInfo from '../MysqlColInfo';
import MysqlIndexInfo from '../MysqlIndexInfo';
import MysqlForeignKeyInfo from '../MysqlForeignKeyInfo';

export default function MysqlEditTable(
	props: MysqlEditTableProps
): JSX.Element {
	const { isEdit } = props;
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const [originData, setOriginData] = useState({
		info: {},
		colInfo: [
			{
				key: 0,
				columnName: 'id',
				columnType: 'int',
				length: '0',
				nullable: false,
				primaryKey: true,
				description: 'lalalal'
			}
		],
		indexInfo: [
			{
				key: 0,
				indexName: 'fff',
				includeCols: ['fdadf(50)', 'ddff(69)'],
				indexType: 'Normal',
				indexWay: '--'
			}
		],
		foreignKeyInfo: []
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
	const save = () => {
		console.log('click save', originData);
	};
	const childrenRender = (type: string) => {
		const componentRender = () => {
			switch (type) {
				case 'basicInfo':
					return (
						<MysqlTableInfo
							isEdit={isEdit || false}
							handleChange={(values: any) =>
								infoChange(values, 'info')
							}
						/>
					);
				case 'colInfo':
					return (
						<MysqlColInfo
							originData={originData.colInfo}
							handleChange={(values: any) =>
								infoChange(values, 'colInfo')
							}
						/>
					);
				case 'indexInfo':
					return (
						<MysqlIndexInfo
							originData={originData.indexInfo}
							handleChange={(values: any) =>
								infoChange(values, 'indexInfo')
							}
						/>
					);
				case 'foreignKeyInfo':
					return (
						<MysqlForeignKeyInfo
							originData={originData.foreignKeyInfo}
							handleChange={(values: any) =>
								infoChange(values, 'foreignKeyInfo')
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
					<Button type="primary" onClick={save}>
						保存
					</Button>
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
			label: '索引信息',
			key: 'indexInfo',
			children: childrenRender('indexInfo')
		},
		{
			label: '外键信息',
			key: 'foreignKeyInfo',
			children: childrenRender('foreignKeyInfo')
		}
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
