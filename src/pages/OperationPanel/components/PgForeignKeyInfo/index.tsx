import React from 'react';
import EditTable from '@/components/EditTable';
import { PgForeignKeyInfoProps } from '../../index.d';
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
export default function PgForeignKeyInfo(
	props: PgForeignKeyInfoProps
): JSX.Element {
	const { originData, handleChange } = props;
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 60,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '外键名',
			dataIndex: 'foreignKeyName',
			key: 'foreignKeyName',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'includeCol',
			key: 'includeCol',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '参考表',
			dataIndex: 'referenceTable',
			key: 'referenceTable',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '参考列',
			dataIndex: 'referenceCol',
			key: 'referenceCol',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '可延迟/延期',
			dataIndex: 'canDelay',
			key: 'canDelay',
			editable: true,
			width: 200,
			componentType: 'radio'
		},
		{
			title: '删除时',
			dataIndex: 'deleteAction',
			key: 'deleteAction',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: deleteAction
		},
		{
			title: '更新时',
			dataIndex: 'updateAction',
			key: 'updateAction',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: updateAction
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			basicData={basicData}
			originData={originData}
			defaultColumns={columns}
			returnValues={onChange}
		/>
	);
}
