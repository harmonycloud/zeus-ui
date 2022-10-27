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
		schemaName
	} = props;
	const [columnsOption] = useState<AutoCompleteOptionItem[]>(
		data?.columnDtoList.map((item: PgsqlColItem) => {
			return { label: item.column, value: item.column };
		}) || []
	);
	const [returnData, setReturnData] = useState([]);
	const [tables, setTables] = useState<AutoCompleteOptionItem[]>([]);
	const [selectRow, setSelectRow] = useState<any>({});
	const [cols, setCols] = useState<any>({});
	useEffect(() => {
		getPgTables({
			clusterId,
			namespace,
			middlewareName,
			databaseName: databaseName,
			schemaName: schemaName
		}).then((res) => {
			if (res.success) {
				setTables(
					res.data.map((item: PgsqlTableItem) => {
						return { label: item.tableName, value: item.tableName };
					})
				);
			}
		});
	}, []);
	useEffect(() => {
		const listCols = Object.keys(cols);
		if (
			selectRow &&
			selectRow?.targetTable &&
			!listCols.includes(selectRow.targetTable)
		) {
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
					setCols({
						...cols,
						[selectRow.targetTable]: list
					});
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
			dataIndex: 'colInfo',
			key: 'colInfo',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: columnsOption
		},
		{
			title: '参考表',
			dataIndex: 'targetTable',
			key: 'targetTable',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: tables
		},
		{
			title: '参考列',
			dataIndex: 'targetColumn',
			key: 'targetColumn',
			editable: true,
			width: 200,
			componentType: 'select',
			selectOptions: cols[selectRow?.targetTable] || []
		}
	];
	const getValues = (values: any) => {
		console.log(values);
		setReturnData(values);
	};
	const getSelectValues = (value: any) => {
		console.log(value);
		setSelectRow(value);
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
				originData={[]}
				defaultColumns={columns}
				basicData={{ colInfo: '', targetTable: '', targetColumn: '' }}
				returnValues={getValues}
				returnSelectValues={getSelectValues}
			/>
		</Modal>
	);
}
