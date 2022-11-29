import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	PgForeignKeyInfoProps,
	pgsqlForeignKeyItem,
	PgsqlTableItem
} from '../../index.d';
import IncludeColsForm from './IncludeColsForm';
import { AutoCompleteOptionItem } from '@/types/comment';
import { getPgTables, updatePgsqlForeign } from '@/services/operatorPanel';
import { Button, Divider, notification, Space } from 'antd';
import storage from '@/utils/storage';
const basicData = {
	name: '',
	contentList: [],
	targetTable: '',
	deferrablity: '',
	onDelete: '',
	onUpdate: '',
	operator: 'add'
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
	disabled: boolean;
}
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
		middlewareName,
		tableName,
		removeActiveKey,
		cancel
	} = props;
	const [open, setOpen] = useState<boolean>(false);
	const [dataSource] = useState<EditPgsqlForeignKeyItem[]>(
		originData?.tableForeignKeyList?.map((item, index) => {
			return {
				...item,
				key: item.name,
				disabled: tableName ? true : false
			};
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
			dataIndex: 'name',
			key: 'name',
			editable: true,
			width: 150,
			rules: [
				{
					type: 'string',
					min: 1,
					max: 64,
					message: '请输入1-63个字符'
				},
				{
					required: true,
					message: '请输入外键名'
				}
			],
			componentType: 'string'
		},
		{
			title: '参考表',
			dataIndex: 'targetTable',
			key: 'targetTable',
			editable: true,
			width: 200,
			rules: [
				{
					required: true,
					message: '请选择参考表'
				}
			],
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
					onClick={() => {
						if (record.disabled) {
							return;
						}
						setOpen(true);
					}}
					style={{ cursor: 'pointer' }}
				>
					<span
						className={
							tableName ? 'disabled-name mr-8' : 'name-link mr-8'
						}
					>
						编辑
					</span>
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
		console.log(values);
		handleChange(values);
	};
	const onCreate = (values: any) => {
		setChangeData({ contentList: values });
		setSelectRow({ ...selectRow, contentList: values });
	};
	const getSelectValues = (value: any) => {
		setSelectRow(value);
	};
	// * 单独修改外键
	const save = () => {
		if (tableName && originData) {
			const storageData = storage.getSession('pg-table-detail');
			let tp: pgsqlForeignKeyItem[];
			if (storageData.tableForeignKeyList.length === 0) {
				tp = originData.tableForeignKeyList || [];
			} else {
				const originTemp = originData?.tableForeignKeyList?.map(
					(item) => item.name
				);
				const deleteList = storageData.tableForeignKeyList.filter(
					(item: any) => {
						if (!originTemp?.includes(item.name)) {
							item.operator = 'delete';
							return item;
						}
					}
				);
				tp = [...(originData.tableForeignKeyList || []), ...deleteList];
			}
			updatePgsqlForeign({
				databaseName: originData.databaseName as string,
				schemaName: originData.schemaName as string,
				tableName,
				clusterId: clusterId,
				namespace: namespace,
				middlewareName: middlewareName,
				oid: originData.oid,
				tableForeignKeyList: originData.tableForeignKeyList
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '外键修改成功！'
					});
					removeActiveKey();
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		}
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
			{tableName && (
				<>
					<Divider />
					<Space>
						<Button type="primary" onClick={save}>
							保存
						</Button>
						<Button onClick={cancel}>取消</Button>
					</Space>
				</>
			)}
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
