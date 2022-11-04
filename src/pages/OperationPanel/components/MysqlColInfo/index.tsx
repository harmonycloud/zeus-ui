import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import { MysqlColInfoProps, MysqlDataType } from '../../index.d';
import { getMysqlDataType } from '@/services/operatorPanel';

const basicData = {
	columnName: '',
	columnType: '',
	length: '0',
	nullable: false,
	primaryKey: true,
	description: ''
};
export default function MysqlColInfo(props: MysqlColInfoProps): JSX.Element {
	const { originData, handleChange, clusterId, namespace, middlewareName } =
		props;
	const [dataTypes, setDataTypes] = useState<MysqlDataType[]>([]);
	useEffect(() => {
		getMysqlDataType({
			clusterId,
			middlewareName,
			namespace
		}).then((res) => {
			if (res.success) {
				setDataTypes(res.data);
			}
		});
	}, []);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列名',
			dataIndex: 'columnName',
			key: 'columnName',
			editable: true,
			width: 250,
			componentType: 'string'
		},
		{
			title: '类型',
			dataIndex: 'columnType',
			key: 'columnType',
			editable: true,
			width: 250,
			componentType: 'select'
		},
		{
			title: '长度',
			dataIndex: 'length',
			key: 'length',
			editable: true,
			width: 100,
			componentType: 'number'
		},
		{
			title: '可空',
			dataIndex: 'nullable',
			key: 'nullable',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '主键',
			dataIndex: 'primaryKey',
			key: 'primaryKey',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '备注',
			dataIndex: 'description',
			key: 'description',
			editable: true,
			componentType: 'string'
		}
	];
	const onChange = (list: any[]) => {
		handleChange(list);
	};
	return (
		<EditTable
			defaultColumns={columns}
			originData={originData}
			basicData={basicData}
			moveDownVisible
			moveUpVisible
			incrementVisible
			returnValues={onChange}
		/>
	);
}
