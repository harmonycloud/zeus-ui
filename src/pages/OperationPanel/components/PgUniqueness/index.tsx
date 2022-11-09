import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	PgsqlColItem,
	pgsqlUniqueItem,
	PgUniquenessProps
} from '../../index.d';
import { updatePgsqlUnique } from '@/services/operatorPanel';
import { Button, Divider, notification, Space } from 'antd';
import storage from '@/utils/storage';

const basicData = {
	name: '',
	columnName: [],
	deferrablity: '',
	operator: 'add'
};
const deferrablityOptions = [
	{ label: '不可延迟', value: 'NOT DEFERRABLE' },
	{ label: '可延迟不可延期', value: 'DEFERRABLE INITIALLY IMMEDIATE' },
	{ label: '可延迟且可延期', value: 'DEFERRABLE INITIALLY DEFERRED' }
];
interface EditPgsqlUniqueItem extends pgsqlUniqueItem {
	key: string;
}
// * 唯一约束
export default function PgUniqueness(props: PgUniquenessProps): JSX.Element {
	const {
		originData,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		tableName
	} = props;
	const [columnNames] = useState(
		originData?.columnDtoList?.map((item: PgsqlColItem) => {
			return { value: item.column, label: item.column };
		})
	);
	const [dataSource] = useState<EditPgsqlUniqueItem[]>(
		originData?.tableUniqueList?.map((item) => {
			return { ...item, key: item.name };
		}) || []
	);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '名称',
			dataIndex: 'name',
			key: 'name',
			width: 200,
			editable: true,
			componentType: 'string'
		},
		{
			title: '字段',
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			componentType: 'mulSelect',
			selectOptions: columnNames
		},
		{
			title: '可延迟/延期',
			dataIndex: 'deferrablity',
			key: 'deferrablity',
			width: 200,
			editable: true,
			componentType: 'select',
			selectOptions: deferrablityOptions
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	const save = () => {
		if (tableName && originData) {
			const storageData = storage.getSession('pg-table-detail');
			let tp: pgsqlUniqueItem[];
			if (storageData.tableUniqueList.length === 0) {
				tp = originData.tableUniqueList || [];
			} else {
				const originTemp = originData?.tableUniqueList?.map(
					(item) => item.name
				);
				const deleteList = storageData.tableUniqueList.filter(
					(item: any) => {
						if (!originTemp?.includes(item.name)) {
							item.operator = 'delete';
							return item;
						}
					}
				);
				tp = [...(originData.tableUniqueList || []), ...deleteList];
			}
			updatePgsqlUnique({
				databaseName: originData.databaseName as string,
				schemaName: originData.schemaName as string,
				tableName: originData.tableName as string,
				clusterId: clusterId,
				namespace: namespace,
				middlewareName: middlewareName,
				oid: originData.oid,
				tableUniqueList: tp
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '唯一约束修改成功!'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	};
	return (
		<>
			<EditTable
				originData={dataSource}
				defaultColumns={columns}
				basicData={basicData}
				returnValues={onChange}
			/>
			{tableName && (
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
		</>
	);
}
