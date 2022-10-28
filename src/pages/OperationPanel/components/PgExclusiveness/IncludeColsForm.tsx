import EditTable from '@/components/EditTable';
import { AutoCompleteOptionItem } from '@/types/comment';
import { Modal } from 'antd';
import React, { useState } from 'react';
import { PgsqlColItem, pgsqlTableDetail } from '../../index.d';

interface IncludesColProps {
	open: boolean;
	onCancel: () => void;
	onCreate: (value: any) => void;
	data: pgsqlTableDetail | undefined;
}
const symbolOptions = [
	{ text: '&&', value: '&&' },
	{ text: '<', value: '<' },
	{ text: '<->', value: '<->' },
	{ text: '<=', value: '<=' },
	{ text: '<>', value: '<>' },
	{ text: '<@', value: '<@' },
	{ text: '=', value: '=' },
	{ text: '>', value: '>' },
	{ text: '>=', value: '>=' },
	{ text: '@', value: '@' },
	{ text: '@>', value: '@>' },
	{ text: '~', value: '~' },
	{ text: '~=', value: '~=' }
];
const orderOptions = [{ text: 'DESC', value: 'DESC' }];
export default function IncludeColsForm(props: IncludesColProps): JSX.Element {
	const { open, onCancel, onCreate, data } = props;
	const [columnsOption] = useState<AutoCompleteOptionItem[]>(
		data?.columnDtoList?.map((item: PgsqlColItem) => {
			return { label: item.column, value: item.column };
		}) || []
	);
	const [returnData, setReturnData] = useState([]);

	const onOk = () => {
		onCreate(returnData);
		onCancel();
	};
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '字段',
			dataIndex: 'field',
			key: 'field',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: columnsOption
		},
		{
			title: '排序',
			dataIndex: 'order',
			key: 'order',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: orderOptions
		},
		{
			title: '操作符',
			dataIndex: 'symbol',
			key: 'symbol',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: symbolOptions
		}
	];
	const getValues = (values: any) => {
		setReturnData(values);
	};
	return (
		<Modal
			title="包含列"
			open={open}
			onCancel={onCancel}
			width={700}
			onOk={onOk}
		>
			<EditTable
				defaultColumns={columns}
				originData={[]}
				basicData={{ field: '', order: '', symbol: '' }}
				returnValues={getValues}
			/>
		</Modal>
	);
}
