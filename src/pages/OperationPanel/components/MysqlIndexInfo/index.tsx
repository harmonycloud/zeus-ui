import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import IncludeColsForm from './IncludeColsForm';
import { MysqlIndexInfoProps } from '../../index.d';
const basicData = {
	indexName: '',
	includeCols: [],
	indexType: '',
	indexWay: ''
};
const indexTypeOptions = [
	{ label: 'Normal', value: 'Normal' },
	{ label: 'Unique', value: 'Unique' },
	{ label: 'Full Text', value: 'Full Text' }
];
const indexWayOptions = [
	{ label: '--', value: '--' },
	{ label: 'BTree', value: 'BTree' },
	{ label: 'Hash', value: 'Hash' }
];
export default function MysqlIndexInfo(
	props: MysqlIndexInfoProps
): JSX.Element {
	const { originData, handleChange } = props;
	const [open, setOpen] = useState<boolean>(false);
	const [changedData, setChangeData] = useState<any>();
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '索引名',
			dataIndex: 'indexName',
			key: 'indexName',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'includeCols',
			key: 'includeCols',
			componentType: 'includeCols',
			render: (_text: any, record: any) => (
				<span
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					{record.includeCols.join(',')}
				</span>
			)
		},
		{
			title: '索引类型',
			dataIndex: 'indexType',
			key: 'indexType',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: indexTypeOptions
		},
		{
			title: '索引方式',
			dataIndex: 'indexWay',
			key: 'indexWay',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: indexWayOptions
		}
	];
	const onCreate = (values: any) => {
		const listData = values.map(
			(item: any) => `${item.colInfo}(${item.length})`
		);
		setChangeData({ includeCols: listData });
	};
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<>
			<EditTable
				defaultColumns={columns}
				originData={originData}
				basicData={basicData}
				changedData={changedData}
				returnValues={onChange}
			/>
			{open && (
				<IncludeColsForm
					open={open}
					onCancel={() => setOpen(false)}
					onCreate={onCreate}
				/>
			)}
		</>
	);
}
