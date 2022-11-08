import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	DatabaseItem,
	MysqlForeignItem,
	MysqlForeignKeyInfoProps,
	PgsqslDatabaseItem
} from '../../index.d';
import { AutoCompleteOptionItem } from '@/types/comment';
import { getAllDatabase } from '@/services/operatorPanel';
import { notification } from 'antd';
const basicData = {
	foreignKey: '',
	details: [],
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
	const { originData, handleChange, clusterId, namespace, middlewareName } =
		props;
	const [dataSource] = useState<EditMysqlForeignItem[]>(
		originData?.foreignKeys?.map((item) => {
			return { ...item, key: item.foreignKey };
		}) || []
	);
	const [columnOptions] = useState<AutoCompleteOptionItem[]>(
		originData?.columns?.map((item) => {
			return { label: item.column, value: item.column };
		}) || []
	);
	const [databases, setDatabases] = useState<AutoCompleteOptionItem[]>([]);
	useEffect(() => {
		getAllDatabase({
			middlewareName,
			clusterId,
			namespace,
			type: 'mysql'
		}).then((res) => {
			if (res.success) {
				setDatabases(
					res.data.map((item: DatabaseItem | PgsqslDatabaseItem) => {
						return {
							value: (item as DatabaseItem).db,
							label: (item as DatabaseItem).db
						};
					})
				);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);

	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '外键名',
			dataIndex: 'foreignKey',
			key: 'foreignKey',
			editable: true,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'details',
			key: 'details',
			editable: true,
			componentType: 'mulSelect',
			selectOptions: columnOptions
		},
		{
			title: '参考库',
			dataIndex: 'referenceDatabase',
			key: 'referenceDatabase',
			editable: true,
			componentType: 'select',
			selectOptions: databases
		},
		{
			title: '参考表',
			dataIndex: 'referenceTable',
			key: 'referenceTable',
			editable: true,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '参考列',
			dataIndex: 'referencedColumn',
			key: 'referencedColumn',
			editable: true,
			componentType: 'select',
			selectOptions: []
		},
		{
			title: '删除时',
			dataIndex: 'onDeleteOption',
			key: 'onDeleteOption',
			editable: true,
			componentType: 'select',
			selectOptions: deleteAction
		},
		{
			title: '更新时',
			dataIndex: 'onUpdateOption',
			key: 'onUpdateOption',
			editable: true,
			componentType: 'select',
			selectOptions: updateAction
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			basicData={basicData}
			originData={dataSource}
			defaultColumns={columns}
			returnValues={onChange}
		/>
	);
}
