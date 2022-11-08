import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import { PgExamineProps, tableCheckItem } from '../../index.d';
import { Button, Divider, notification, Space } from 'antd';
import { updatePgsqlCheck } from '@/services/operatorPanel';
import storage from '@/utils/storage';

const basicData = {
	name: '',
	text: '',
	noInherit: false,
	notValid: false,
	operator: 'add'
};
interface EditTableCheckItem extends tableCheckItem {
	key: string;
}
// * 检查约束
export default function PgExamine(props: PgExamineProps): JSX.Element {
	const {
		originData,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		tableName
	} = props;
	const [dataSource] = useState<EditTableCheckItem[]>(
		originData?.tableCheckList?.map((item: tableCheckItem) => {
			return { ...item, key: item.name };
		}) || []
	);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
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
			title: '检查',
			dataIndex: 'text',
			key: 'text',
			editable: true,
			componentType: 'string'
		},
		{
			title: '非继承',
			dataIndex: 'noInherit',
			key: 'noInherit',
			editable: true,
			componentType: 'checkbox'
		},
		{
			title: '不验证',
			dataIndex: 'notValid',
			key: 'notValid',
			editable: true,
			componentType: 'checkbox'
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	const save = () => {
		if (tableName && originData) {
			const storageData = storage.getSession('pg-table-detail');
			let tp: tableCheckItem[];
			if (storageData.tableCheckList.length === 0) {
				tp = originData?.tableCheckList || [];
			} else {
				const originTemp = originData?.tableCheckList?.map(
					(item) => item.name
				);
				const deleteList = storageData.tableCheckList.filter(
					(item: any) => {
						if (!originTemp?.includes(item.name)) {
							item.operator = 'delete';
							return item;
						}
					}
				);
				tp = [...(originData.tableCheckList || []), ...deleteList];
			}
			updatePgsqlCheck({
				databaseName: originData.databaseName as string,
				schemaName: originData.schemaName as string,
				tableName,
				clusterId: clusterId,
				namespace: namespace,
				middlewareName: middlewareName,
				tableCheckList: tp
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '检查约束修改成功!'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
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
						<Button>取消</Button>
					</Space>
				</>
			)}
		</>
	);
}
