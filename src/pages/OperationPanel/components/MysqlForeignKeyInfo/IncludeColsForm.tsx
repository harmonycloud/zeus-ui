import EditTable from '@/components/EditTable';
import { getCols } from '@/services/operatorPanel';
import { AutoCompleteOptionItem } from '@/types/comment';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { MysqlTableDetail, MysqlColItem } from '../../index.d';

interface IncludeColsFormProps {
	open: boolean;
	onCancel: () => void;
	onCreate: (values: any) => void;
	originData: MysqlTableDetail | undefined;
	selectRow: any;
	clusterId: string;
	namespace: string;
	middlewareName: string;
}
export default function IncludeColsForm(
	props: IncludeColsFormProps
): JSX.Element {
	const {
		open,
		onCancel,
		originData,
		selectRow,
		clusterId,
		namespace,
		middlewareName,
		onCreate
	} = props;
	const [colInfoOption] = useState(
		originData?.columns?.map((item: MysqlColItem) => {
			return { label: item.column, value: item.column };
		}) || []
	);
	const [cols, setCols] = useState<AutoCompleteOptionItem[]>([]);
	const [dataSource] = useState<[]>(
		selectRow?.details?.map((item: any, index: number) => {
			return { ...item, key: index };
		}) || []
	);
	const [returnData, setReturnData] = useState<any>();
	useEffect(() => {
		if (selectRow) {
			if (selectRow.referenceDatabase && selectRow.referenceTable) {
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					database: selectRow.referenceDatabase,
					table: selectRow.referenceTable
				};
				getCols(sendData).then((res) => {
					if (res.success) {
						setCols(
							res.data.map((item) => {
								return {
									label: item.column,
									value: item.column
								};
							})
						);
					}
				});
			}
		}
	}, [selectRow]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列信息',
			dataIndex: 'column',
			key: 'column',
			editable: true,
			componentType: 'select',
			selectOptions: colInfoOption
		},
		{
			title: '参考列',
			dataIndex: 'referencedColumn',
			key: 'referencedColumn',
			editable: true,
			componentType: 'select',
			selectOptions: cols
		}
	];
	const getValues = (values: any) => {
		setReturnData(values);
	};
	const onOk = () => {
		onCreate(returnData);
		onCancel();
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
				defaultColumns={columns}
				originData={dataSource}
				basicData={{ column: '', referencedColumn: '' }}
				returnValues={getValues}
			/>
		</Modal>
	);
}
