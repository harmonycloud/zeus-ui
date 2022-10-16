import EditTable from '@/components/EditTable';
import { Modal } from 'antd';
import React, { useState } from 'react';

interface IncludeColsForm {
	open: boolean;
	onCancel: () => void;
	onCreate: (value: any) => void;
}
export default function IncludeColsForm({
	open,
	onCancel,
	onCreate
}: IncludeColsForm): JSX.Element {
	const [colInfoOption, setColInfoOption] = useState([
		{ value: 'test', label: 'test' },
		{ value: 'test1', label: 'test1' }
	]);
	const [returnData, setReturnData] = useState([]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列信息',
			dataIndex: 'colInfo',
			key: 'colInfo',
			editable: true,
			componentType: 'select',
			selectOptions: colInfoOption
		},
		{
			title: '长度',
			dataIndex: 'length',
			key: 'length',
			editable: true,
			componentType: 'number'
		}
	];
	const onOk = () => {
		onCreate(returnData);
		onCancel();
	};
	const getValues = (values: any) => {
		setReturnData(values);
	};
	return (
		<Modal
			width={700}
			title="包含列"
			open={open}
			onCancel={onCancel}
			onOk={onOk}
		>
			<EditTable
				originData={[]}
				defaultColumns={columns}
				basicData={{ colInfo: '', length: '' }}
				saveVisible={false}
				cancelVisible={false}
				returnValues={getValues}
			/>
		</Modal>
	);
}
