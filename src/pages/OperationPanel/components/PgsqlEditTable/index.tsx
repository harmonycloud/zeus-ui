import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Divider, notification, Space, Tabs } from 'antd';
import PgInherit from '../PgInherit';
import PgsqlTableInfo from '../PgsqlTableInfo';
import PgsqlColInfo from '../PgsqlColInfo';
import PgExamine from '../PgExamine';
import PgUniqueness from '../PgUniqueness';
import PgForeignKeyInfo from '../PgForeignKeyInfo';
import {
	ParamsProps,
	PgsqlEditTableProps,
	pgsqlTableDetail
} from '../../index.d';
import PgExclusiveness from '../PgExclusiveness';
import { getPgsqlTableDetail } from '@/services/operatorPanel';
export default function PgsqlEditTable(
	props: PgsqlEditTableProps
): JSX.Element {
	const { isEdit, schemaName, dbName, tableName } = props;
	const params: ParamsProps = useParams();
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const [originData, setOriginData] = useState<pgsqlTableDetail>();
	const [data, setData] = useState<pgsqlTableDetail>();
	useEffect(() => {
		if (tableName) {
			getPgsqlTableDetail({
				databaseName: dbName,
				tableName: tableName,
				schemaName: schemaName,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			}).then((res) => {
				if (res.success) {
					setOriginData(res.data);
					setData(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, []);
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
	const childrenRender = (type: string) => {
		const componentRender = () => {
			switch (type) {
				case 'basicInfo':
					return (
						<PgsqlTableInfo
							handleChange={(values: any) =>
								infoChange(values, 'info')
							}
							dbName={dbName}
							schemaName={schemaName}
							data={data}
						/>
					);
				case 'colInfo':
					return (
						<PgsqlColInfo
							originData={data?.columnDtoList || []}
							handleChange={(values: any) =>
								infoChange(values, 'columnDtoList')
							}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
						/>
					);
				case 'foreignKeyInfo':
					return (
						<PgForeignKeyInfo
							originData={data}
							handleChange={(values: any) =>
								infoChange(values, 'tableForeignKeyList')
							}
							databaseName={dbName}
							schemaName={schemaName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
						/>
					);
				case 'exclusiveness':
					return (
						<PgExclusiveness
							originData={data}
							handleChange={(values: any) =>
								infoChange(values, 'tableExclusionList')
							}
							databaseName={dbName}
						/>
					);
				case 'uniqueness':
					return (
						<PgUniqueness
							originData={data}
							handleChange={(values: any) =>
								infoChange(values, 'tableUniqueList')
							}
						/>
					);
				case 'examine':
					return (
						<PgExamine
							originData={data?.tableCheckList || []}
							handleChange={(values: any) =>
								infoChange(values, 'tableCheckList')
							}
						/>
					);
				case 'inherit':
					return (
						<PgInherit
							data={data}
							handleChange={(values: any) =>
								infoChange(values, 'inherit')
							}
							databaseName={dbName}
							schemaName={schemaName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
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
