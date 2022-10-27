import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import { PgForeignKeyInfoProps, pgsqlForeignKeyItem } from '../../index.d';
import IncludeColsForm from './IncludeColsForm';
import { Select } from 'antd';
const basicData = {
	foreignKeyName: '',
	includeCol: '',
	referenceLib: '',
	referenceTable: '',
	referenceCol: '',
	deleteAction: '',
	updateAction: ''
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
	const [open, setOpen] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<EditPgsqlForeignKeyItem[]>(
		originData?.tableForeignKeyList.map((item) => {
			return { ...item, key: item.name };
		}) || []
	);
	const [changedData, setChangeData] = useState<any>();
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
			title: '包含列',
			dataIndex: 'includeCol',
			key: 'includeCol',
			editable: true,
			width: 200,
			render: (text: any, record: EditPgsqlForeignKeyItem) => (
				<span
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					编辑
					{/* {record?.includeCols?.join(',')} */}
				</span>
			)
		},
		{
			title: '可延迟/延期',
			dataIndex: 'deferrablity',
			key: 'deferrablity',
			width: 200,
			render: () => (
				<Select
					style={{ width: '100%' }}
					dropdownMatchSelectWidth={false}
				>
					<Option value="NOT DEFERRABLE">不可延迟</Option>
					<Option value="DEFERRABLE INITIALLY IMMEDIATE">
						可延迟不可延期
					</Option>
					<Option value="DEFERRABLE INITIALLY DEFERRED">
						可延迟且可延期
					</Option>
				</Select>
			)
		},
		{
			title: '删除时',
			dataIndex: 'deleteAction',
			key: 'deleteAction',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: deleteAction
		},
		{
			title: '更新时',
			dataIndex: 'updateAction',
			key: 'updateAction',
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
		const listData = values
			.map(
				(item: any) =>
					`${item.colInfo} -> ${item.targetTable}(${item.targetColumn})`
			)
			.join(',');
		setChangeData({ includeCols: listData });
	};
	return (
		<>
			<EditTable
				basicData={basicData}
				originData={dataSource}
				defaultColumns={columns}
				changedData={changedData}
				returnValues={onChange}
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
				/>
			)}
		</>
	);
}
