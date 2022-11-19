import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	ExclusionContentItem,
	exclusionItem,
	PgExclusivenessProps
} from '../../index.d';
import { updatePgsqlExclusion } from '@/services/operatorPanel';
import IncludeColsForm from './IncludeColsForm';
import { Button, Divider, notification, Space } from 'antd';
import storage from '@/utils/storage';
const accessModeOptions = [
	{ label: 'btree', value: 'btree' },
	{ label: 'gist', value: 'gist' },
	{ label: 'hash', value: 'hash' },
	{ label: 'spgist', value: 'spgist' }
];
interface EditExclusionItem extends exclusionItem {
	key: string;
	disabled: boolean;
}
// * 排他性约束
export default function PgExclusiveness(
	props: PgExclusivenessProps
): JSX.Element {
	const {
		originData,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		tableName
	} = props;
	const [open, setOpen] = useState<boolean>(false);
	const [dataSource] = useState<EditExclusionItem[]>(
		originData?.tableExclusionList?.map((item) => {
			return {
				...item,
				key: item.name,
				disabled: tableName ? true : false
			};
		}) || []
	);
	const [changedData, setChangeData] = useState<any>();
	const [selectRow, setSelectRow] = useState<any>({});
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 60,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			editable: true,
			componentType: 'string'
		},
		{
			title: '包含列',
			dataIndex: 'contentList',
			key: 'contentList',
			width: 250,
			render: (text: any, record: EditExclusionItem) => (
				<span
					onClick={() => {
						if (record.disabled) {
							return;
						}
						setOpen(true);
					}}
					style={{ cursor: 'pointer' }}
				>
					<span
						className={
							record.disabled
								? 'disabled-name mr-8'
								: 'name-link mr-8'
						}
					>
						编辑
					</span>
					{record?.contentList
						?.map(
							(item: ExclusionContentItem) =>
								`${item.columnName}->${item.order}(${item.symbol})`
						)
						.join(';')}
				</span>
			)
		},
		{
			title: '访问方式',
			dataIndex: 'indexMethod',
			key: 'indexMethod',
			width: 150,
			editable: true,
			componentType: 'select',
			selectOptions: accessModeOptions
		}
	];
	const onChange = (values: any) => {
		// change 上层originData
		handleChange(values);
	};
	const onCreate = (values: any) => {
		// change editTable的显示
		setChangeData({ contentList: values });
		setSelectRow({ ...selectRow, contentList: values });
	};
	const getSelectValues = (value: any) => {
		setSelectRow(value);
	};
	const save = () => {
		if (tableName && originData) {
			const storageData = storage.getSession('pg-table-detail');
			let tp: exclusionItem[];
			if (storageData.tableExclusionList.length === 0) {
				tp = originData.tableExclusionList || [];
			} else {
				const originTemp = originData?.tableExclusionList?.map(
					(item) => item.name
				);
				const deleteList = storageData.tableExclusionList.map(
					(item: any) => {
						if (!originTemp?.includes(item.name)) {
							item.operator = 'delete';
							return item;
						}
					}
				);
				tp = [...(originData.tableExclusionList || []), ...deleteList];
			}
			tp = tp.filter((item) => item !== null);
			updatePgsqlExclusion({
				databaseName: originData.databaseName as string,
				schemaName: originData.schemaName as string,
				tableName,
				clusterId: clusterId,
				namespace: namespace,
				middlewareName: middlewareName,
				oid: originData.oid,
				tableExclusionList: tp
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '排他性约束修改成功！'
					});
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
				basicData={{
					name: '',
					contentList: [],
					indexMethod: '',
					operator: 'add'
				}}
				changedData={changedData}
				returnValues={onChange}
				returnSelectValues={getSelectValues}
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
			{open && (
				<IncludeColsForm
					open={open}
					onCancel={() => setOpen(false)}
					onCreate={onCreate}
					data={originData}
					selectRow={selectRow}
				/>
			)}
		</>
	);
}
