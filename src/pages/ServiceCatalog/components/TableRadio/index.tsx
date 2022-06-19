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
	const { id = '', onCallBack, dataList = mysqlDataList } = props;
	const columns = [
		{ title: 'CPU', dataIndex: 'cpu' },
		{ title: '内存', dataIndex: 'memory' }
	];
	const [selectedRowKeys, setSelectedRowKeys] = useState(['1']);
	const rowSelection = {
		selectedRowKeys: selectedRowKeys,
		onChange: (selectedRowKeys: any, selectedRows: any) => {
			onCallBack(selectedRowKeys[0]);
			setSelectedRowKeys(selectedRowKeys);
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
						onCallBack(selectedRowKeys[0]);
						setSelectedRowKeys([record.id]);
					}
				};
			}}
			size="middle"
			pagination={false}
		/>
	);
}
