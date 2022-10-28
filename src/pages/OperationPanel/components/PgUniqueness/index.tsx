import React, { useState } from 'react';
import { RadioChangeEvent, Select } from 'antd';
import EditTable from '@/components/EditTable';
import {
	PgsqlColItem,
	pgsqlForeignKeyItem,
	pgsqlUniqueItem,
	PgUniquenessProps
} from '../../index.d';

const { Option } = Select;
const basicData = {
	name: '',
	columnName: '',
	deferrablity: ''
};
interface EditPgsqlForeignKeyItem extends pgsqlForeignKeyItem {
	key: string;
}
// * 唯一约束
export default function PgUniqueness(props: PgUniquenessProps): JSX.Element {
	const { originData, handleChange } = props;
	const [columnNames] = useState(
		originData?.columnDtoList?.map((item: PgsqlColItem) => {
			return { value: item.column, text: item.column };
		})
	);
	const [dataSource] = useState<EditPgsqlForeignKeyItem[]>(
		originData?.tableForeignKeyList?.map((item) => {
			return { ...item, key: item.name };
		}) || []
	);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '名称',
			dataIndex: 'name',
			key: 'name',
			editable: true,
			componentType: 'string'
		},
		{
			title: '字段',
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			componentType: 'select',
			selectOptions: columnNames
		},
		{
			title: '可延迟/延期',
			dataIndex: 'deferrablity',
			key: 'deferrablity',
			render: (text: any, record: EditPgsqlForeignKeyItem) => (
				<Select style={{ width: 120 }} dropdownMatchSelectWidth={false}>
					<Option value="NOT DEFERRABLE">不可延迟</Option>
					<Option value="DEFERRABLE INITIALLY IMMEDIATE">
						可延迟不可延期
					</Option>
					<Option value="DEFERRABLE INITIALLY DEFERRED">
						可延迟且可延期
					</Option>
				</Select>
			)
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			originData={dataSource}
			defaultColumns={columns}
			basicData={basicData}
			returnValues={onChange}
		/>
	);
}
