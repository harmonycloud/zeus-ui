import EditTable from '@/components/EditTable';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { MysqlColItem, MysqlTableDetail, includesCol } from '../../index.d';

interface IncludeColsForm {
	open: boolean;
	onCancel: () => void;
	onCreate: (value: any) => void;
	originData: MysqlTableDetail | undefined;
	selectRow: any;
}
export default function IncludeColsForm({
	open,
	onCancel,
	onCreate,
	originData,
	selectRow
}: IncludeColsForm): JSX.Element {
	console.log(originData);
	console.log(selectRow);
	const [colInfoOption] = useState(
		originData?.columns?.map((item: MysqlColItem) => {
			return { label: item.column, value: item.column };
		}) || []
	);
	const [dataSource] = useState<any[]>(
		selectRow.indexColumns.map((item: any, index: number) => {
			return { ...item, key: index };
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
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			componentType: 'select',
			selectOptions: colInfoOption
		},
		{
			title: '长度',
			dataIndex: 'subPart',
			key: 'subPart',
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
				originData={dataSource}
				defaultColumns={defaultColumns}
				basicData={{ columnName: '', subPart: '' }}
				returnValues={getValues}
			/>
		</Modal>
	);
}
