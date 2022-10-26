import React, { useState } from 'react';
import { Radio, RadioChangeEvent, Space } from 'antd';
import EditTable from '@/components/EditTable';
import {
	PgsqlColItem,
	pgsqlUniqueItem,
	PgUniquenessProps
} from '../../index.d';

const basicData = {
	name: '',
	field: '',
	canDelay: ''
};
export default function PgUniqueness(props: PgUniquenessProps): JSX.Element {
	const { originData, handleChange } = props;
	const [radioValue, setRadioValue] = useState<any>();
	const [columnNames, setColumnNames] = useState(
		originData?.columnDtoList?.map((item: PgsqlColItem) => {
			return { value: item.columnName, text: item.columnName };
		})
	);
	const handleRadioChange = (e: RadioChangeEvent) => {
		console.log(e);
		setRadioValue(e.target.value);
	};
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 100,
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
			dataIndex: 'canDelay',
			key: 'canDelay',
			render: (text: any, record: pgsqlUniqueItem) => (
				<Radio.Group onChange={handleRadioChange} value={radioValue}>
					<Space direction="vertical">
						<Radio value="DEFERRABLE INITIALLY DEFERRED">
							可延迟
						</Radio>
						<Radio value="DEFERRABLE INITIALLY IMMEDIATE">
							延期
						</Radio>
					</Space>
				</Radio.Group>
			)
		}
	];
	const onChange = (values: any) => {
		handleChange(values);
	};
	return (
		<EditTable
			rowKey="name"
			originData={originData?.tableUniqueList}
			defaultColumns={columns}
			basicData={basicData}
			returnValues={onChange}
		/>
	);
}
