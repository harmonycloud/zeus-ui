import React from 'react';
import { useState } from 'react';
import { Table } from 'antd';
import { TableRadioProps } from './tableRadio';

/**
 *
 * @param { id, isMysql, onCallBack } props
 * id 一项数据的唯一id
 */
export default function TableRadio(props: TableRadioProps): JSX.Element {
	const { id = '', isMysql = false, onCallBack } = props;
	const columns = [
		{ title: '规格', dataIndex: 'spec' },
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
	if (isMysql) {
		columns.push({ title: '推荐连接数', dataIndex: 'num' });
	}
	const dataList = [
		{
			id: '1',
			spec: '基本性能',
			cpu: '1 Core',
			memory: '2 Gi',
			num: '600'
		},
		{
			id: '2',
			spec: '一般性能',
			cpu: '2 Core',
			memory: '8 Gi',
			num: '2000'
		},
		{
			id: '3',
			spec: '较强性能',
			cpu: '4 Core',
			memory: '16 Gi',
			num: '4000'
		},
		{
			id: '4',
			spec: '高强性能',
			cpu: '8 Core',
			memory: '32 Gi',
			num: '8000'
		},
		{
			id: '5',
			spec: '超强性能',
			cpu: '16 Core',
			memory: '64 Gi',
			num: '16000'
		}
	];

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
