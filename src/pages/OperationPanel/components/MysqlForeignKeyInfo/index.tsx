import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import { MysqlForeignItem, MysqlForeignKeyInfoProps } from '../../index.d';
import { AutoCompleteOptionItem } from '@/types/comment';
const basicData = {
	foreignKey: '',
	column: '',
	referenceLib: '',
	referenceTable: '',
	referencedColumn: '',
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
interface EditMysqlForeignItem extends MysqlForeignItem {
	key: string;
}
export default function MysqlForeignKeyInfo(
	props: MysqlForeignKeyInfoProps
): JSX.Element {
	const { originData, handleChange } = props;
	const [dataSource] = useState<EditMysqlForeignItem[]>(
		originData?.foreignKeys.map((item) => {
			return { ...item, key: item.foreignKey };
		}) || []
	);
	const [columnOptions] = useState<AutoCompleteOptionItem[]>(
		originData?.columns.map((item) => {
			return { label: item.column, value: item.column };
		}) || []
	);

	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '外键名',
			dataIndex: 'foreignKey',
			key: 'foreignKey',
			editable: true,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'column',
			key: 'column',
			editable: true,
			componentType: 'select',
			selectOptions: columnOptions
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
			dataIndex: 'referencedColumn',
			key: 'referencedColumn',
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
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			basicData={basicData}
			originData={dataSource}
			defaultColumns={columns}
			returnValues={onChange}
		/>
	);
}
