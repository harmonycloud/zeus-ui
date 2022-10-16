import React, { useState } from 'react';
import EditTable from '@/components/EditTable';

const basicData = {
	columnName: '',
	columnType: '',
	length: '0',
	nullable: false,
	primaryKey: true,
	description: ''
};
export default function ColInfo(): JSX.Element {
	const [originData, setOriginData] = useState([
		{
			key: 0,
			columnName: 'id',
			columnType: 'int',
			length: '0',
			nullable: false,
			primaryKey: true,
			description: 'lalalal'
		}
	]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列名',
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			componentType: 'string'
		},
		{
			title: '类型',
			dataIndex: 'columnType',
			key: 'columnType',
			editable: true,
			componentType: 'select'
		},
		{
			title: '长度',
			dataIndex: 'length',
			key: 'length',
			editable: true,
			componentType: 'string'
		},
		{
			title: '可空',
			dataIndex: 'nullable',
			key: 'nullable',
			editable: true,
			componentType: 'checkbox'
			// render: (text: boolean | undefined) => <Checkbox checked={text} />
		},
		{
			title: '主键',
			dataIndex: 'primaryKey',
			key: 'primaryKey',
			editable: true,
			componentType: 'checkbox'
			// render: (text: boolean | undefined) => <Checkbox checked={text} />
		},
		{
			title: '备注',
			dataIndex: 'description',
			key: 'description',
			editable: true,
			componentType: 'string'
		}
	];
	return (
		<EditTable
			defaultColumns={columns}
			originData={originData}
			basicData={basicData}
			moveDownVisible
			moveUpVisible
			incrementVisible
		/>
	);
}
