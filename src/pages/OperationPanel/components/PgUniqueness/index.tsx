import EditTable from '@/components/EditTable';
import React from 'react';
import { PgUniquenessProps } from '../../index.d';

const basicData = {
	name: '',
	field: '',
	canDelay: ''
};
export default function PgUniqueness(props: PgUniquenessProps): JSX.Element {
	const { originData, handleChange } = props;
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
