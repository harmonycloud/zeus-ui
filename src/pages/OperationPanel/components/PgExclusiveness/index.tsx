import React, { useState } from 'react';
import EditTable from '@/components/EditTable';
import {
	ExclusionContentItem,
	exclusionItem,
	PgExclusivenessProps
} from '../../index.d';
import IncludeColsForm from './IncludeColsForm';
const accessModeOptions = [
	{ label: 'btree', value: 'btree' },
	{ label: 'gist', value: 'gist' },
	{ label: 'hash', value: 'hash' },
	{ label: 'spgist', value: 'spgist' }
];
interface EditExclusionItem extends exclusionItem {
	key: string;
}
// * 排他性约束
export default function PgExclusiveness(
	props: PgExclusivenessProps
): JSX.Element {
	const { originData, handleChange } = props;
	const [open, setOpen] = useState<boolean>(false);
	const [dataSource] = useState<EditExclusionItem[]>(
		originData?.tableExclusionList?.map((item) => {
			return { ...item, key: item.name };
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
					onClick={() => setOpen(true)}
					style={{ cursor: 'pointer' }}
				>
					编辑
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
	return (
		<>
			<EditTable
				defaultColumns={columns}
				originData={dataSource}
				basicData={{ name: '', contentList: [], indexMethod: '' }}
				changedData={changedData}
				returnValues={onChange}
				returnSelectValues={getSelectValues}
			/>
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
