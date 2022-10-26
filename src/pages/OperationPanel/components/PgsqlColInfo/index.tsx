import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import { PgsqlColInfoProps } from '../../index.d';

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
export default function PgsqlColInfo(props: PgsqlColInfoProps): JSX.Element {
	const { originData, handleChange } = props;
	console.log(originData);
	const columns = [
		{
			title: '序号',
			dataIndex: 'num',
			key: 'num',
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
			dataIndex: 'dateType',
			key: 'dateType',
			editable: true,
			width: 150,
			componentType: 'select'
		},
		{
			title: '数组',
			dataIndex: 'array',
			key: 'array',
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
			dataIndex: 'defaultValue',
			key: 'defaultValue',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '长度',
			dataIndex: 'size',
			key: 'size',
			editable: true,
			width: 100,
			componentType: 'string'
		},
		{
			title: '备注',
			dataIndex: 'comment',
			key: 'comment',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '校验规则',
			dataIndex: 'collate',
			key: 'collate',
			editable: true,
			width: 150,
			componentType: 'select'
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			originData={originData}
			defaultColumns={columns}
			basicData={basicData}
			returnValues={onChange}
		/>
	);
}
