import React, { useEffect, useState } from 'react';
import { Button, Divider, notification, Space, Tabs } from 'antd';
import {
	MysqlEditTableProps,
	MysqlEngineItem,
	MysqlTableDetail,
	ParamsProps
} from '../../index.d';
import MysqlTableInfo from '../MysqlTableInfo';
import MysqlColInfo from '../MysqlColInfo';
import MysqlIndexInfo from '../MysqlIndexInfo';
import MysqlForeignKeyInfo from '../MysqlForeignKeyInfo';
import {
	getMysqlDetail,
	createMysqlTable,
	getMysqlEngine
} from '@/services/operatorPanel';
import { useParams } from 'react-router';

export default function MysqlEditTable(
	props: MysqlEditTableProps
): JSX.Element {
	const { tableName, dbName } = props;
	const params: ParamsProps = useParams();
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const [originData, setOriginData] = useState<MysqlTableDetail>();
	const [engineData, setEngineData] = useState<MysqlEngineItem[]>([]);
	useEffect(() => {
		getMysqlEngine({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				setEngineData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
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
		if (dataIndex === 'basicInfo') {
			setOriginData({ ...originData, ...values });
		} else if (dataIndex === 'foreignKeys') {
			const list = values.map((item: any) => {
				item.details = item.details?.map((i: any) => {
					return {
						column: i.column,
						foreignKey: item.foreignKey,
						referenceDatabase: item.referenceDatabase,
						referenceTable: item.referenceTable,
						referencedColumn: i.referencedColumn
					};
				});
				return item;
			});
			setOriginData({ ...originData, foreignKeys: list });
		} else {
			const result = {
				[dataIndex]: values
			};
			setOriginData({ ...originData, ...result });
		}
	};
	const save = () => {
		console.log('click save', originData);
		const sendData = {
			...originData,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			database: dbName
		};
		createMysqlTable(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '创建成功！'
				});
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const childrenRender = (type: string) => {
		const componentRender = () => {
			switch (type) {
				case 'basicInfo':
					return (
						<MysqlTableInfo
							handleChange={(values: any) =>
								infoChange(values, 'basicInfo')
							}
							originData={originData}
							tableName={tableName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							engineData={engineData}
							databaseName={dbName}
						/>
					);
				case 'colInfo':
					return (
						<MysqlColInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'columns')
							}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							databaseName={dbName}
						/>
					);
				case 'indexInfo':
					return (
						<MysqlIndexInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'indices')
							}
							engineData={engineData}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							databaseName={dbName}
						/>
					);
				case 'foreignKeyInfo':
					return (
						<MysqlForeignKeyInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'foreignKeys')
							}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							databaseName={dbName}
						/>
					);
				default:
					break;
			}
		};
		return (
			<div>
				{componentRender()}
				{!tableName && (
					<>
						<Divider />
						<Space>
							<Button type="primary" onClick={save}>
								保存
							</Button>
							<Button>取消</Button>
						</Space>
					</>
				)}
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
