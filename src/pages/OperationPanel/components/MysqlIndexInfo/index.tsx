import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import IncludeColsForm from './IncludeColsForm';
import { IndexItem, MysqlEngineItem, MysqlIndexInfoProps } from '../../index.d';
import { AutoCompleteOptionItem } from '@/types/comment';
import { Button, Divider, notification, Space } from 'antd';
import { updateMysqlIndex } from '@/services/operatorPanel';
const basicData = {
	index: '',
	indexColumns: [],
	storageType: '',
	type: ''
};
interface EditIndexItem extends IndexItem {
	key: string;
}
export default function MysqlIndexInfo(
	props: MysqlIndexInfoProps
): JSX.Element {
	const {
		originData,
		handleChange,
		engineData,
		tableName,
		clusterId,
		namespace,
		middlewareName,
		databaseName,
		cancel,
		removeActiveKey
	} = props;
	const [open, setOpen] = useState<boolean>(false);
	const [changedData, setChangeData] = useState<any>();
	const [selectRow, setSelectRow] = useState<any>({});
	const [dataSource] = useState<EditIndexItem[]>(
		originData?.indices?.map((item) => {
			return { ...item, key: item.index };
		}) || []
	);
	const [indexTypeOptions, setIndexTypeOptions] = useState<
		AutoCompleteOptionItem[]
	>([]);
	const [indexWayOptions, setIndexWayOptions] = useState<
		AutoCompleteOptionItem[]
	>([]);
	useEffect(() => {
		if (engineData) {
			const element = engineData.find(
				(item: MysqlEngineItem) => item.engine === originData?.engine
			);
			if (element) {
				setIndexTypeOptions(
					element.storageTypes.map((item: string) => {
						return { value: item, label: item };
					})
				);
				setIndexWayOptions(
					element.indexTypes.map((item: string) => {
						return { value: item, label: item };
					})
				);
			}
		}
	}, [engineData]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '索引名',
			dataIndex: 'index',
			key: 'index',
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
					message: '请输入索引名'
				}
			],
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'indexColumns',
			key: 'indexColumns',
			render: (_text: any, record: any) => (
				<span
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					编辑
					{record?.indexColumns
						?.map(
							(item: any) => `${item.columnName}(${item.subPart})`
						)
						.join(',')}
				</span>
			)
		},
		{
			title: '索引类型',
			dataIndex: 'storageType',
			key: 'storageType',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: indexTypeOptions
		},
		{
			title: '索引方式',
			dataIndex: 'type',
			key: 'type',
			editable: true,
			width: 150,
			componentType: 'select',
			selectOptions: indexWayOptions
		}
	];
	const onCreate = (values: any) => {
		setChangeData({ indexColumns: values });
	};
	const onChange = (values: any) => {
		handleChange(values);
	};
	const getSelectValue = (value: any) => {
		setSelectRow(value);
	};
	const save = () => {
		if (tableName && originData) {
			updateMysqlIndex({
				database: databaseName,
				table: tableName,
				clusterId,
				namespace,
				middlewareName,
				indices: originData.indices
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '索引信息修改成功'
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
				defaultColumns={columns}
				originData={dataSource}
				basicData={basicData}
				changedData={changedData}
				returnValues={onChange}
				returnSelectValues={getSelectValue}
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
				/>
			)}
		</>
	);
}
