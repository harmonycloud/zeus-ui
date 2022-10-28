import EditTable from '@/components/EditTable';
import { getPgCols, getPgTables } from '@/services/operatorPanel';
import { AutoCompleteOptionItem } from '@/types/comment';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { PgsqlColItem, pgsqlTableDetail, PgsqlTableItem } from '../../index.d';

interface IncludeColsFormProps {
	open: boolean;
	onCancel: () => void;
	onCreate: (value: any) => void;
	data: pgsqlTableDetail | undefined;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	databaseName: string;
	schemaName: string;
	selectRow: any;
}
export default function IncludeColsForm(
	props: IncludeColsFormProps
): JSX.Element {
	const {
		open,
		onCancel,
		onCreate,
		data,
		clusterId,
		namespace,
		middlewareName,
		databaseName,
		schemaName,
		selectRow
	} = props;
	const [columnsOption] = useState<AutoCompleteOptionItem[]>(
		data?.columnDtoList?.map((item: PgsqlColItem) => {
			return { label: item.column, value: item.column };
		}) || []
	);
	const [returnData, setReturnData] = useState([]);
	const [cols, setCols] = useState<AutoCompleteOptionItem[]>([]);
	const [dataSource, setDataSource] = useState(
		selectRow?.contentList.map((item: any, index: number) => {
			return { ...item, key: index };
		}) || []
	);
	useEffect(() => {
		if (selectRow && selectRow?.targetTable) {
			getPgCols({
				clusterId,
				namespace,
				middlewareName,
				databaseName: databaseName,
				schemaName: schemaName,
				tableName: selectRow.targetTable
			}).then((res) => {
				if (res.success) {
					const list = res.data.map((item: PgsqlColItem) => {
						return { label: item.column, value: item.column };
					});
					setCols(list);
				}
			});
		}
	}, [selectRow]);
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
			title: '包含列',
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: columnsOption
		},
		{
			title: '参考列',
			dataIndex: 'targetColumn',
			key: 'targetColumn',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: cols
		}
	];
	const getValues = (values: any) => {
		console.log(values);
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
				originData={dataSource}
				defaultColumns={columns}
				basicData={{ columnName: '', targetColumn: '' }}
				returnValues={getValues}
			/>
		</Modal>
	);
}
