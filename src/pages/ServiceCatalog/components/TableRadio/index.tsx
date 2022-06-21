import React from 'react';
import { useState } from 'react';
import { Table } from 'antd';
import { TableRadioProps } from './tableRadio';
import { mysqlDataList } from '@/utils/const';

/**
 *
 * @param { id, isMysql, onCallBack } props
 * id 一项数据的唯一id
 */
export default function TableRadio(props: TableRadioProps): JSX.Element {
	const { id, onCallBack, dataList = mysqlDataList } = props;
	const columns = [
		{ title: 'CPU', dataIndex: 'cpu' },
		{ title: '内存', dataIndex: 'memory' }
	];
	const [selectedRowKeys, setSelectedRowKeys] = useState([id]);
	const rowSelection = {
		selectedRowKeys: selectedRowKeys,
		onChange: (selectedRowKeys: any, selectedRows: any) => {
			console.log(selectedRowKeys, selectedRows);
			setSelectedRowKeys(selectedRowKeys);
			onCallBack(selectedRowKeys[0]);
		}
	};

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={dataList}
			rowSelection={{
				type: 'radio',
				...rowSelection
			}}
			onRow={(record: any) => {
				return {
					onClick: () => {
						setSelectedRowKeys([record.id]);
						onCallBack(record.id);
					}
				};
			}}
			size="middle"
			pagination={false}
		/>
	);
}
