import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	PgsqlColItem,
	pgsqlUniqueItem,
	PgUniquenessProps
} from '../../index.d';

const basicData = {
	name: '',
	columnName: [],
	deferrablity: ''
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
	const { originData, handleChange } = props;
	console.log(originData);
	const [columnNames] = useState(
		originData?.columnDtoList?.map((item: PgsqlColItem) => {
			return { value: item.column, label: item.column };
		})
	);
	console.log(columnNames);
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
	return (
		<EditTable
			originData={dataSource}
			defaultColumns={columns}
			basicData={basicData}
			returnValues={onChange}
		/>
	);
}
