import React from 'react';
import EditTable from '@/components/EditTable';
import { PgExamineProps } from '../../index.d';

const basicData = {
	name: '',
	examine: '',
	unInherit: '',
	unVerification: '',
	remark: ''
};
export default function PgExamine(props: PgExamineProps): JSX.Element {
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
			title: '检查',
			dataIndex: 'examine',
			key: 'examine',
			editable: true,
			componentType: 'string'
		},
		{
			title: '非继承',
			dataIndex: 'unInherit',
			key: 'unInherit',
			editable: true,
			componentType: 'checkbox'
		},
		{
			title: '不验证',
			dataIndex: 'unVerification',
			key: 'unVerification',
			editable: true,
			componentType: 'checkbox'
		},
		{
			title: '备注',
			dataIndex: 'remark',
			key: 'remark',
			editable: true,
			componentType: 'string'
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
