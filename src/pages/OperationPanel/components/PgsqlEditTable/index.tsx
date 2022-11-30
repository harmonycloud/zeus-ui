import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Divider, notification, Space, Tabs, Modal } from 'antd';
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
import { getPgsqlTableDetail, createPgTable } from '@/services/operatorPanel';
import storage from '@/utils/storage';
const { confirm } = Modal;
export default function PgsqlEditTable(
	props: PgsqlEditTableProps
): JSX.Element {
	const { schemaName, dbName, tableName, removeActiveKey, onRefresh } = props;
	console.log(props);
	const params: ParamsProps = useParams();
	const [activeKey, setActiveKey] = useState<string>('basicInfo');
	const [originData, setOriginData] = useState<pgsqlTableDetail>();
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
					// * 待优化 编辑时将数据存储在sessionStorage中，用于编辑对比
					storage.setSession('pg-table-detail', res.data);
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
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
		const result = {
			[dataIndex]: values
		};
		if (dataIndex === 'info') {
			setOriginData({ ...originData, ...values });
		} else if (dataIndex === 'inherit') {
			const list = values?.tablesName?.map((item: string) => {
				const result: any = {};
				result.databaseName = dbName;
				result.schemaName = values.schemaName;
				result.tableName = item;
				return result;
			});
			setOriginData({ ...originData, tableInheritList: list });
		} else if (dataIndex === 'tableUniqueList') {
			const list = values.map((item: any) => {
				item.columnName = item.columnName.join(',');
				return item;
			});
			setOriginData({ ...originData, tableUniqueList: list });
		} else if (dataIndex === 'columnDtoList') {
			const list = values.map((item: any) => {
				item.num = item.key;
				return item;
			});
			setOriginData({ ...originData, columnDtoList: list });
		} else {
			setOriginData({ ...originData, ...result });
		}
	};
	const save = () => {
		const sendData = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			databaseName: dbName,
			schemaName,
			...originData
		};
		createPgTable(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '创建成功!'
				});
				removeActiveKey();
				onRefresh && onRefresh();
			} else {
				notification.error({
					message: '失败',
					description: (
						<>
							<p>{res.errorMsg}</p>
							<p>{res.errorDetail}</p>
						</>
					)
				});
			}
		});
	};
	const cancel = () => {
		confirm({
			title: '操作提醒',
			content: '该操作会关闭当前tab页面，造成数据丢失，请确认操作！',
			onOk: () => {
				removeActiveKey();
			}
		});
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
							data={originData}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							onRefresh={onRefresh}
							cancel={cancel}
						/>
					);
				case 'colInfo':
					return (
						<PgsqlColInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'columnDtoList')
							}
							databaseName={dbName}
							schemaName={schemaName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							cancel={cancel}
						/>
					);
				case 'foreignKeyInfo':
					return (
						<PgForeignKeyInfo
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'tableForeignKeyList')
							}
							databaseName={dbName}
							schemaName={schemaName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							cancel={cancel}
						/>
					);
				case 'exclusiveness':
					return (
						<PgExclusiveness
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'tableExclusionList')
							}
							databaseName={dbName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							cancel={cancel}
						/>
					);
				case 'uniqueness':
					return (
						<PgUniqueness
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'tableUniqueList')
							}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							cancel={cancel}
						/>
					);
				case 'examine':
					return (
						<PgExamine
							originData={originData}
							handleChange={(values: any) =>
								infoChange(values, 'tableCheckList')
							}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							cancel={cancel}
						/>
					);
				case 'inherit':
					return (
						<PgInherit
							data={originData}
							handleChange={(values: any) =>
								infoChange(values, 'inherit')
							}
							databaseName={dbName}
							schemaName={schemaName}
							clusterId={params.clusterId}
							namespace={params.namespace}
							middlewareName={params.name}
							tableName={tableName}
							removeActiveKey={removeActiveKey}
							cancel={cancel}
						/>
					);
				default:
					break;
			}
		};
		return (
			<div>
				{tableName && (
					<Alert
						message="切换当前页面时，可能会造成未保存的数据丢失，请谨慎操作！"
						type="info"
						showIcon
						closable
						style={{ marginBottom: 16 }}
					/>
				)}
				{componentRender()}
				{!tableName && (
					<>
						<Divider />
						<Space>
							<Button type="primary" onClick={save}>
								保存
							</Button>
							<Button onClick={cancel}>取消</Button>
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
