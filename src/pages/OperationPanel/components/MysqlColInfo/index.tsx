import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import { MysqlColInfoProps, MysqlColItem, MysqlDataType } from '../../index.d';
import { getMysqlDataType } from '@/services/operatorPanel';
import { AutoCompleteOptionItem } from '@/types/comment';

const basicData = {
	column: '',
	columnType: '',
	size: '0',
	nullable: false,
	primary: true,
	autoIncrement: false,
	comment: ''
};
interface EditMysqlColItem extends MysqlColItem {
	key: string;
}
export default function MysqlColInfo(props: MysqlColInfoProps): JSX.Element {
	const { originData, handleChange, clusterId, namespace, middlewareName } =
		props;
	const [dataSource, setDataSource] = useState<EditMysqlColItem[]>(
		originData?.columns?.map((item) => {
			return { ...item, key: item.column };
		}) || []
	);
	const [dataTypes, setDataTypes] = useState<any[]>([]);
	const [selectRow, setSelectRow] = useState<EditMysqlColItem>();
	useEffect(() => {
		getMysqlDataType({
			clusterId,
			middlewareName,
			namespace
		}).then((res) => {
			if (res.success) {
				const list = res.data.map((item: MysqlDataType) => {
					return {
						label: item.name,
						value: item.name
					};
				});
				setDataTypes(list);
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
			dataIndex: 'column',
			key: 'column',
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
			componentType: 'select',
			selectOptions: dataTypes
		},
		{
			title: '长度',
			dataIndex: 'size',
			key: 'size',
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
			dataIndex: 'primary',
			key: 'primary',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '自增',
			dataIndex: 'autoIncrement',
			key: 'autoIncrement',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '备注',
			dataIndex: 'comment',
			key: 'comment',
			editable: true,
			componentType: 'string'
		}
	];
	const onChange = (list: any[]) => {
		handleChange(list);
	};
	const onSelectChange = (values: any) => {
		setSelectRow(values);
	};
	return (
		<EditTable
			defaultColumns={columns}
			originData={dataSource}
			basicData={basicData}
			moveDownVisible
			moveUpVisible
			incrementVisible
			returnValues={onChange}
			returnSelectValues={onSelectChange}
		/>
	);
}
