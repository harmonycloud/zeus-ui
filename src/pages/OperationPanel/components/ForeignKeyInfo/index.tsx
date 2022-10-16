import EditTable from '@/components/EditTable';
import React from 'react';

const basicData = {
	foreignKeyName: '',
	includeCol: '',
	referenceLib: '',
	referenceTable: '',
	referenceCol: '',
	deleteAction: '',
	updateAction: ''
};
const deleteAction = [
	{ label: 'RESTRICT', value: 'RESTRICT' },
	{ label: 'NO ACTION', value: 'NO ACTION' },
	{ label: 'CASCADE', value: 'CASCADE' },
	{ label: 'SET NULL', value: 'SET NULL' }
];
const updateAction = [
	{ label: 'RESTRICT', value: 'RESTRICT' },
	{ label: 'NO ACTION', value: 'NO ACTION' },
	{ label: 'CASCADE', value: 'CASCADE' },
	{ label: 'SET NULL', value: 'SET NULL' }
];
export default function ForeignKeyInfo(): JSX.Element {
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '外键名',
			dataIndex: 'foreignKeyName',
			key: 'foreignKeyName',
			editable: true,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'includeCol',
			key: 'includeCol',
			editable: true,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '参考库',
			dataIndex: 'referenceLib',
			key: 'referenceLib',
			editable: true,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '参考表',
			dataIndex: 'referenceTable',
			key: 'referenceTable',
			editable: true,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '参考列',
			dataIndex: 'referenceCol',
			key: 'referenceCol',
			editable: true,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '删除时',
			dataIndex: 'deleteAction',
			key: 'deleteAction',
			editable: true,
			componentType: 'select',
			selectOptions: deleteAction
		},
		{
			title: '更新时',
			dataIndex: 'updateAction',
			key: 'updateAction',
			editable: true,
			componentType: 'select',
			selectOptions: updateAction
		}
	];
	return (
		<EditTable
			basicData={basicData}
			originData={[]}
			defaultColumns={columns}
		/>
	);
}
