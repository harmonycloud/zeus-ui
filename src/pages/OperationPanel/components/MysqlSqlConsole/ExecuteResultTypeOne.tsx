import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import { ExecuteResultTypeOneProps } from '../../index.d';

export default function ExecuteResultTypeOne(
	props: ExecuteResultTypeOneProps
): JSX.Element {
	const { resData } = props;
	const [dataSource] = useState<any>(resData.data);
	const [columns, setColumns] = useState<ColumnsType<any>>([]);
	useEffect(() => {
		const indexObj = {
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			fixed: 'left'
		};
		const list =
			resData?.columns.map((item: any, index: number) => {
				return {
					indexInTable: index + 1,
					title: item,
					key: item,
					dataIndex: item,
					sorter: (a: any, b: any) => a[item] - b[item],
					width: 150
				};
			}) || [];
		list.unshift(indexObj);
		console.log(list);
		setColumns(list);
	}, []);
	return (
		<div style={{ width: '100%' }}>
			<Table<any>
				size="small"
				dataSource={dataSource}
				columns={columns}
				rowKey="indexInTable"
				scroll={{
					x: 150 * columns.length + 180
				}}
				pagination={{
					size: 'small',
					showSizeChanger: true,
					showQuickJumper: true
				}}
			/>
		</div>
	);
}
