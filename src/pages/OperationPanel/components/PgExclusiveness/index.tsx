import React from 'react';
import EditTable from '@/components/EditTable';
import { PgExclusivenessProps } from '../../index.d';
const accessModeOptions = [
	{ label: 'btree', value: 'btree' },
	{ label: 'gist', value: 'gist' },
	{ label: 'hash', value: 'hash' },
	{ label: 'spgist', value: 'spgist' }
];
export default function PgExclusiveness(
	props: PgExclusivenessProps
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
			title: '名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			editable: true,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'includeCol',
			key: 'includeCol',
			width: 150,
			editable: true,
			componentType: 'select'
		},
		{
			title: '参考表',
			dataIndex: 'referenceTable',
			key: 'referenceTable',
			width: 150,
			editable: true,
			componentType: 'select'
		},
		{
			title: '参考列',
			dataIndex: 'referenceCol',
			key: 'referenceCol',
			width: 150,
			editable: true,
			componentType: 'select'
		},
		{
			title: '访问方式',
			dataIndex: 'accessMode',
			key: 'accessMode',
			width: 150,
			editable: true,
			componentType: 'select',
			selectOptions: accessModeOptions
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			defaultColumns={columns}
			originData={[]}
			basicData={{}}
			returnValues={onChange}
		/>
	);
}
