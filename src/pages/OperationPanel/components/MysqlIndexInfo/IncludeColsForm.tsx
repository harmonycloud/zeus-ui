import EditTable from '@/components/EditTable';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { MysqlColItem } from '../../index.d';

interface IncludeColsForm {
	open: boolean;
	onCancel: () => void;
	onCreate: (value: any) => void;
	data: any;
	columns: MysqlColItem[];
}
export default function IncludeColsForm({
	open,
	onCancel,
	onCreate,
	data,
	columns
}: IncludeColsForm): JSX.Element {
	const [colInfoOption] = useState(
		columns.map((item: MysqlColItem) => {
			return { label: item.column, value: item.column };
		})
	);
	const [returnData, setReturnData] = useState([]);
	const defaultColumns = [
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
	useEffect(() => {
		if (data) {
			console.log(data);
		}
	}, []);
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
				defaultColumns={defaultColumns}
				basicData={{ colInfo: '', length: '' }}
				returnValues={getValues}
			/>
		</Modal>
	);
}
