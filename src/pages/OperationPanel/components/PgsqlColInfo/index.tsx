import EditTable from '@/components/EditTable';
import React, { useState } from 'react';

const basicData = {
	columnName: '',
	columnType: '',
	isArray: false,
	nullable: true,
	primaryKey: false,
	default: '',
	length: '',
	description: '',
	rule: ''
};
export default function PgsqlColInfo(): JSX.Element {
	const [dataSource, setDataSource] = useState([
		{
			key: '1',
			columnName: 'ss',
			columnType: 'ss',
			isArray: false,
			nullable: true,
			primaryKey: false,
			default: 'ss',
			length: 's',
			description: 's',
			rule: 'ss'
		}
	]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 100,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列名',
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '类型',
			dataIndex: 'columnType',
			key: 'columnType',
			editable: true,
			width: 150,
			componentType: 'select'
		},
		{
			title: '数组',
			dataIndex: 'isArray',
			key: 'isArray',
			editable: true,
			width: 50,
			componentType: 'checkbox'
		},
		{
			title: '可空',
			dataIndex: 'nullable',
			key: 'nullable',
			editable: true,
			componentType: 'checkbox',
			width: 50
		},
		{
			title: '主键',
			dataIndex: 'primaryKey',
			key: 'primaryKey',
			editable: true,
			width: 50,
			componentType: 'checkbox'
		},
		{
			title: '默认值',
			dataIndex: 'default',
			key: 'default',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '长度',
			dataIndex: 'length',
			key: 'length',
			editable: true,
			width: 100,
			componentType: 'string'
		},
		{
			title: '备注',
			dataIndex: 'description',
			key: 'description',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '校验规则',
			dataIndex: 'rule',
			key: 'rule',
			editable: true,
			width: 150,
			componentType: 'select'
		}
	];
	return (
		<EditTable
			originData={dataSource}
			defaultColumns={columns}
			basicData={basicData}
			scroll={{ x: 1100 }}
		/>
	);
}
