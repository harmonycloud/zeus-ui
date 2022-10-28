import React, { useEffect, useState } from 'react';
import { Button, Divider, Space, Tabs } from 'antd';
import {
	MysqlEditTableProps,
	MysqlTableDetail,
	ParamsProps
} from '../../index.d';
import MysqlTableInfo from '../MysqlTableInfo';
import MysqlColInfo from '../MysqlColInfo';
import MysqlIndexInfo from '../MysqlIndexInfo';
import MysqlForeignKeyInfo from '../MysqlForeignKeyInfo';
import { getMysqlDetail } from '@/services/operatorPanel';
import { useParams } from 'react-router';

export default function MysqlEditTable(
	props: MysqlEditTableProps
): JSX.Element {
	const { tableName, dbName } = props;
	const params: ParamsProps = useParams();
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const [originData, setOriginData] = useState<MysqlTableDetail>();
	useEffect(() => {
		if (tableName) {
			getMysqlDetail({
				database: dbName,
				table: tableName,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			}).then((res) => {
				if (res.success) {
					setOriginData(res.data);
				}
			});
		}
	}, [tableName]);
	const onChange = (key: string) => {
		setActiveKey(key);
	};
	const infoChange = (values: any, dataIndex: string) => {
		console.log(values, dataIndex);
		// setOriginData({
		// 	...originData,
		// 	[dataIndex]: values
		// });
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
							handleChange={(values: any) =>
								infoChange(values, 'info')
							}
							originData={originData}
						/>
					);
				case 'colInfo':
					return (
						<MysqlColInfo
							originData={originData?.columns || []}
							handleChange={(values: any) =>
								infoChange(values, 'columns')
							}
						/>
					);
				case 'indexInfo':
					return (
						<MysqlIndexInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'indices')
							}
						/>
					);
				case 'foreignKeyInfo':
					return (
						<MysqlForeignKeyInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'foreignKeys')
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
