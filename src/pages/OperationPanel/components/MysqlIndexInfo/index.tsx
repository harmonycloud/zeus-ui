import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import IncludeColsForm from './IncludeColsForm';
import { IndexItem, MysqlIndexInfoProps } from '../../index.d';
const basicData = {
	index: '',
	indexColumns: [],
	storageType: '',
	type: ''
};
const indexTypeOptions = [
	{ label: 'Normal', value: 'Normal' },
	{ label: 'Unique', value: 'Unique' },
	{ label: 'Full Text', value: 'Full Text' }
];
const indexWayOptions = [
	{ label: '--', value: '' },
	{ label: 'BTree', value: 'BTree' },
	{ label: 'Hash', value: 'Hash' }
];
interface EditIndexItem extends IndexItem {
	key: string;
}
export default function MysqlIndexInfo(
	props: MysqlIndexInfoProps
): JSX.Element {
	const { originData, handleChange } = props;
	const [open, setOpen] = useState<boolean>(false);
	const [changedData, setChangeData] = useState<any>();
	const [selectRow, setSelectRow] = useState<any>({});
	const [dataSource] = useState<EditIndexItem[]>(
		originData?.indices?.map((item) => {
			return { ...item, key: item.index };
		}) || []
	);
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
			dataIndex: 'index',
			key: 'index',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'indexColumns',
			key: 'indexColumns',
			render: (_text: any, record: any) => (
				<span
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					编辑
					{record?.indexColumns
						?.map(
							(item: any) => `${item.columnName}(${item.subPart})`
						)
						.join(',')}
				</span>
			)
		},
		{
			title: '索引类型',
			dataIndex: 'storageType',
			key: 'storageType',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: indexTypeOptions
		},
		{
			title: '索引方式',
			dataIndex: 'type',
			key: 'type',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: indexWayOptions
		}
	];
	const onCreate = (values: any) => {
		setChangeData({ indexColumns: values });
	};
	const onChange = (values: any) => {
		handleChange(values);
	};
	const getSelectValue = (value: any) => {
		setSelectRow(value);
	};
	return (
		<>
			<EditTable
				defaultColumns={columns}
				originData={dataSource}
				basicData={basicData}
				changedData={changedData}
				returnValues={onChange}
				returnSelectValues={getSelectValue}
			/>
			{open && (
				<IncludeColsForm
					open={open}
					onCancel={() => setOpen(false)}
					onCreate={onCreate}
					originData={originData}
					selectRow={selectRow}
				/>
			)}
		</>
	);
}
