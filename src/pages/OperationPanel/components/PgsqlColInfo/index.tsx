import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import { PgsqlColInfoProps, PgsqlColItem } from '../../index.d';
import {
	getPgsqlCollate,
	getPgsqlDataType,
	updatePgsqlCol
} from '@/services/operatorPanel';
import { AutoCompleteOptionItem } from '@/types/comment';
import { Button, Divider, notification, Space } from 'antd';
const basicData = {
	column: '',
	dataType: '',
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
	const {
		originData,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		tableName,
		databaseName,
		schemaName,
		removeActiveKey,
		cancel
	} = props;
	console.log(props);
	const [dataSource] = useState<EditPgsqlColItem[]>(
		originData?.columnDtoList?.map((item: PgsqlColItem) => {
			return { ...item, key: item.num };
		}) || []
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
			dataIndex: 'dataType',
			key: 'dataType',
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
	const save = () => {
		if (tableName && originData) {
			updatePgsqlCol({
				databaseName,
				schemaName,
				tableName,
				clusterId,
				namespace,
				middlewareName,
				oid: originData.oid,
				columnDtoList: originData.columnDtoList
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '列信息修改成功!'
					});
					removeActiveKey();
				} else {
					notification.error({
						message: '失败',
						description: `${res.errorMsg}${
							res.errorDetail ? ':' + res.errorDetail : ''
						}`
					});
				}
			});
		}
	};
	return (
		<>
			<EditTable
				originData={dataSource}
				defaultColumns={columns}
				basicData={basicData}
				returnValues={onChange}
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
		</>
	);
}
