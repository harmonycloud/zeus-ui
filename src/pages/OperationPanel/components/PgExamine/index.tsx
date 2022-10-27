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
// * 检查约束
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
			dataIndex: 'text',
			key: 'text',
			editable: true,
			componentType: 'string'
		},
		{
			title: '非继承',
			dataIndex: 'noInherit',
			key: 'noInherit',
			editable: true,
			componentType: 'checkbox'
		},
		{
			title: '不验证',
			dataIndex: 'notValid',
			key: 'notValid',
			editable: true,
			componentType: 'checkbox'
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
