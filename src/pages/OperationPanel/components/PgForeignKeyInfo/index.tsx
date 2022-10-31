import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	PgForeignKeyInfoProps,
	pgsqlForeignKeyItem,
	PgsqlTableItem
} from '../../index.d';
import IncludeColsForm from './IncludeColsForm';
import { Select } from 'antd';
import { AutoCompleteOptionItem } from '@/types/comment';
import { getPgTables } from '@/services/operatorPanel';
const basicData = {
	foreignKeyName: '',
	contentList: [],
	targetTable: '',
	deferrablity: '',
	onDelete: '',
	onUpdate: ''
};
const deleteAction = [
	{ label: 'RESTRICT', value: 'RESTRICT' },
	{ label: 'NO ACTION', value: 'NO ACTION' },
	{ label: 'CASCADE', value: 'CASCADE' },
	{ label: 'SET NULL', value: 'SET NULL' }
];
const updateAction = [
	{ label: 'RESTRICT', value: 'RESTRICT' },
	{ label: 'NO ACTION', value: 'NO ACTION' },
	{ label: 'CASCADE', value: 'CASCADE' },
	{ label: 'SET NULL', value: 'SET NULL' }
];
const deferrablityOptions = [
	{ label: '不可延迟', value: 'NOT DEFERRABLE' },
	{ label: '可延迟不可延期', value: 'DEFERRABLE INITIALLY IMMEDIATE' },
	{ label: '可延迟且可延期', value: 'DEFERRABLE INITIALLY DEFERRED' }
];
interface EditPgsqlForeignKeyItem extends pgsqlForeignKeyItem {
	key: string;
}
const { Option } = Select;
// * 外键信息
export default function PgForeignKeyInfo(
	props: PgForeignKeyInfoProps
): JSX.Element {
	const {
		originData,
		handleChange,
		databaseName,
		schemaName,
		clusterId,
		namespace,
		middlewareName
	} = props;
	console.log(originData);
	const [open, setOpen] = useState<boolean>(false);
	const [dataSource] = useState<EditPgsqlForeignKeyItem[]>(
		originData?.tableForeignKeyList?.map((item) => {
			return { ...item, key: item.name };
		}) || []
	);
	const [tables, setTables] = useState<AutoCompleteOptionItem[]>([]);
	const [changedData, setChangeData] = useState<any>();
	const [selectRow, setSelectRow] = useState<any>({});
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
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 60,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '外键名',
			dataIndex: 'foreignKeyName',
			key: 'foreignKeyName',
			editable: true,
			width: 150,
			componentType: 'string'
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
			title: '包含列',
			dataIndex: 'contentList',
			key: 'contentList',
			editable: true,
			width: 200,
			render: (text: any, record: EditPgsqlForeignKeyItem) => (
				<span
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					编辑
					{record?.contentList
						?.map(
							(item) =>
								`${item.columnName} -> (${item.targetColumn})`
						)
						.join(',')}
				</span>
			)
		},
		{
			title: '可延迟/延期',
			dataIndex: 'deferrablity',
			key: 'deferrablity',
			width: 200,
			editable: true,
			componentType: 'select',
			selectOptions: deferrablityOptions
		},
		{
			title: '删除时',
			dataIndex: 'onDelete',
			key: 'onDelete',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: deleteAction
		},
		{
			title: '更新时',
			dataIndex: 'onUpdate',
			key: 'onUpdate',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: updateAction
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	const onCreate = (values: any) => {
		setChangeData({ contentList: values });
		setSelectRow({ ...selectRow, contentList: values });
	};
	const getSelectValues = (value: any) => {
		setSelectRow(value);
	};
	return (
		<>
			<EditTable
				basicData={basicData}
				originData={dataSource}
				defaultColumns={columns}
				changedData={changedData}
				returnValues={onChange}
				returnSelectValues={getSelectValues}
			/>
			{open && (
				<IncludeColsForm
					open={open}
					onCancel={() => setOpen(false)}
					onCreate={onCreate}
					data={originData}
					databaseName={databaseName}
					schemaName={schemaName}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					selectRow={selectRow}
				/>
			)}
		</>
	);
}
