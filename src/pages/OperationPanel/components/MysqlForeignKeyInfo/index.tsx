import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	DatabaseItem,
	MysqlForeignItem,
	MysqlForeignItemDetailItem,
	MysqlForeignKeyInfoProps,
	PgsqlDatabaseItem
} from '../../index.d';
import { AutoCompleteOptionItem } from '@/types/comment';
import {
	getAllDatabase,
	getDbTables,
	updateMysqlForeign
} from '@/services/operatorPanel';
import { Button, Divider, notification, Space } from 'antd';
import IncludeColsForm from './IncludeColsForm';
const basicData = {
	foreignKey: '',
	details: undefined,
	referenceDatabase: '',
	referenceTable: '',
	referencedColumn: '',
	onDeleteOption: '',
	onUpdateOption: ''
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
interface EditMysqlForeignItem extends MysqlForeignItem {
	key: string;
}
export default function MysqlForeignKeyInfo(
	props: MysqlForeignKeyInfoProps
): JSX.Element {
	const {
		originData,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		tableName,
		databaseName,
		cancel,
		removeActiveKey
	} = props;
	console.log(originData);
	const [dataSource] = useState<EditMysqlForeignItem[]>(
		originData?.foreignKeys?.map((item, index) => {
			return {
				...item,
				key: index + ''
			};
		}) || []
	);
	const [changedData, setChangeData] = useState<any>();
	const [databases, setDatabases] = useState<AutoCompleteOptionItem[]>([]);
	const [tables, setTables] = useState<AutoCompleteOptionItem[]>([]);
	const [selectRow, setSelectRow] = useState<any>();
	const [open, setOpen] = useState<boolean>(false);
	useEffect(() => {
		getAllDatabase({
			middlewareName,
			clusterId,
			namespace,
			type: 'mysql'
		}).then((res) => {
			if (res.success) {
				setDatabases(
					res.data.map((item: DatabaseItem | PgsqlDatabaseItem) => {
						return {
							value: (item as DatabaseItem).db,
							label: (item as DatabaseItem).db
						};
					})
				);
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
	}, []);
	useEffect(() => {
		if (selectRow) {
			if (selectRow.referenceDatabase) {
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					database: selectRow.referenceDatabase
				};
				getDbTables(sendData).then((res) => {
					if (res.success) {
						setTables(
							res.data.map((item) => {
								return {
									label: item.tableName,
									value: item.tableName
								};
							})
						);
					}
				});
			}
		}
	}, [selectRow?.referenceDatabase]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '外键名',
			dataIndex: 'foreignKey',
			key: 'foreignKey',
			editable: true,
			width: 150,
			rules: [
				{
					type: 'string',
					min: 1,
					max: 64,
					message: '请输入1-64个字符'
				},
				{
					required: true,
					message: '请输入外键名'
				}
			],
			componentType: 'string'
		},
		{
			title: '参考库',
			dataIndex: 'referenceDatabase',
			key: 'referenceDatabase',
			editable: true,
			componentType: 'select',
			width: 250,
			rules: [
				{
					required: true,
					message: '请选择参考库'
				}
			],
			selectOptions: databases
		},
		{
			title: '参考表',
			dataIndex: 'referenceTable',
			key: 'referenceTable',
			editable: true,
			componentType: 'select',
			width: 250,
			rules: [
				{
					required: true,
					message: '请选择参考表'
				}
			],
			selectOptions: tables
		},
		{
			title: '包含列',
			dataIndex: 'details',
			key: 'details',
			width: 250,
			render: (_text: any, record: any) => (
				<span
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					编辑
					{record?.details
						?.map(
							(item: any) =>
								`${item.column}(${item.referencedColumn})`
						)
						.join(',')}
				</span>
			)
		},
		{
			title: '删除时',
			dataIndex: 'onDeleteOption',
			key: 'onDeleteOption',
			editable: true,
			componentType: 'select',
			width: 150,
			selectOptions: deleteAction
		},
		{
			title: '更新时',
			dataIndex: 'onUpdateOption',
			key: 'onUpdateOption',
			editable: true,
			componentType: 'select',
			width: 150,
			selectOptions: updateAction
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	const onSelectValue = (values: any) => {
		setSelectRow(values);
	};
	const onCreate = (values: any) => {
		setChangeData({ details: values });
	};
	const save = () => {
		if (tableName && originData) {
			updateMysqlForeign({
				database: databaseName,
				table: tableName,
				clusterId,
				namespace,
				middlewareName,
				foreignKeys: originData.foreignKeys
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '外键修改成功!'
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
				returnValues={onChange}
				returnSelectValues={onSelectValue}
				changedData={changedData}
				scroll={{ x: 1530 }}
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
					originData={originData}
					selectRow={selectRow}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
				/>
			)}
		</>
	);
}
