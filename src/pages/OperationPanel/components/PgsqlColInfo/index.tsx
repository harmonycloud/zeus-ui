import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import { PgsqlColInfoProps, PgsqlColItem } from '../../index.d';
import { getPgsqlCollate, getPgsqlDataType } from '@/services/operatorPanel';
import { AutoCompleteOptionItem } from '@/types/comment';
const basicData = {
	column: '',
	dateType: '',
	array: false,
	nullable: true,
	primaryKey: false,
	defaultValue: '',
	size: '',
	comment: '',
	collate: ''
};
interface EditPgsqlColItem extends PgsqlColItem {
	key: string;
}
// * 列信息
export default function PgsqlColInfo(props: PgsqlColInfoProps): JSX.Element {
	const { originData, handleChange, clusterId, namespace, middlewareName } =
		props;
	const [dataSource, setDataSource] = useState<EditPgsqlColItem[]>(
		originData.map((item: PgsqlColItem) => {
			return { ...item, key: item.num };
		})
	);
	const [collates, setCollates] = useState<AutoCompleteOptionItem[]>([]);
	const [dataTypes, setDataTypes] = useState<AutoCompleteOptionItem[]>([]);
	useEffect(() => {
		getPgsqlCollate({
			clusterId,
			namespace,
			middlewareName
		}).then((res) => {
			if (res.success) {
				const list = res.data.map((item: string) => {
					return {
						label: item,
						value: item
					};
				});
				setCollates(list);
			}
		});
		getPgsqlDataType({
			clusterId,
			namespace,
			middlewareName
		}).then((res) => {
			if (res.success) {
				const list = res.data.map((item: string) => {
					return {
						label: item,
						value: item
					};
				});
				setDataTypes(list);
			}
		});
	}, []);
	const columns = [
		{
			title: '序号',
			dataIndex: 'num',
			key: 'num',
			width: 100,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列名',
			dataIndex: 'column',
			key: 'column',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '类型',
			dataIndex: 'dateType',
			key: 'dateType',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: dataTypes
		},
		{
			title: '数组',
			dataIndex: 'array',
			key: 'array',
			editable: true,
			width: 50,
			componentType: 'checkbox'
		},
		{
			title: '可空',
			dataIndex: 'nullable',
			key: 'nullable',
			editable: true,
			componentType: 'checkbox',
			width: 50
		},
		{
			title: '主键',
			dataIndex: 'primaryKey',
			key: 'primaryKey',
			editable: true,
			width: 50,
			componentType: 'checkbox'
		},
		{
			title: '默认值',
			dataIndex: 'defaultValue',
			key: 'defaultValue',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '长度',
			dataIndex: 'size',
			key: 'size',
			editable: true,
			width: 100,
			componentType: 'string'
		},
		{
			title: '备注',
			dataIndex: 'comment',
			key: 'comment',
			editable: true,
			width: 150,
			componentType: 'string'
		},
		{
			title: '校验规则',
			dataIndex: 'collate',
			key: 'collate',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: collates
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
