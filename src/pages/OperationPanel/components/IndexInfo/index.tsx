import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import IncludeColsForm from './IncludeColsForm';

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
export default function IndexInfo(): JSX.Element {
	const [originData, setOriginData] = useState([
		{
			key: 0,
			indexName: 'fff',
			includeCols: ['fdadf(50)', 'ddff(69)'],
			indexType: 'Normal',
			indexWay: '--'
		}
	]);
	const [open, setOpen] = useState<boolean>(false);
	const [changedData, setChangeData] = useState<any>();
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '索引名',
			dataIndex: 'indexName',
			key: 'indexName',
			editable: true,
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
			componentType: 'select',
			selectOptions: indexTypeOptions
		},
		{
			title: '索引方式',
			dataIndex: 'indexWay',
			key: 'indexWay',
			editable: true,
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
	return (
		<>
			<EditTable
				defaultColumns={columns}
				originData={originData}
				basicData={basicData}
				changedData={changedData}
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
