import EditTable from '@/components/EditTable';
import React from 'react';

const basicData = {
	name: '',
	field: '',
	canDelay: ''
};
export default function PgUniqueness(): JSX.Element {
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '名称',
			dataIndex: 'name',
			key: 'name',
			editable: true,
			componentType: 'string'
		},
		{
			title: '字段',
			dataIndex: 'field',
			key: 'field',
			editable: true,
			componentType: 'select'
		},
		{
			title: '可延迟/延期',
			dataIndex: 'canDelay',
			key: 'canDelay',
			editable: true,
			componentType: 'radio'
		}
	];
	return (
		<EditTable
			originData={[]}
			defaultColumns={columns}
			basicData={basicData}
		/>
	);
}
