import React from 'react';
import { useState } from 'react';
import { Table, Select, Input, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import './index.scss';

const { Search } = Input;
export default function TableRadio(props: any): JSX.Element {
	const {
		selectedRow,
		selectedRowKeys,
		setSelectedRowKeys,
		setSelectedRow,
		showHeader,
		label,
		select,
		search,
		showRefresh,
		onRefresh,
		...option
	} = props;
	const rowSelection = {
		selectedRowKeys: selectedRowKeys,
		onChange: (selectedRowKeys: any, selectedRows: any) => {
			setSelectedRow(selectedRows[0]);
			setSelectedRowKeys(selectedRowKeys);
		}
	};
	return (
		<div>
			{showHeader ? (
				<div className="table-radio-header">
					<div className="header-search">
						{label && <div className="label">{label}</div>}
						{select && <Select {...select} />}
						{search && <Search {...search} />}
					</div>
					{showRefresh && (
						<Button
							type="default"
							icon={<ReloadOutlined />}
							onClick={onRefresh}
						/>
					)}
				</div>
			) : null}
			<Table
				rowKey={(record) =>
					record.name + record.clusterId + record.namespace
				}
				rowSelection={{
					type: 'radio',
					...rowSelection
				}}
				// onRow={(record: any) => {
				// 	return {
				// 		onClick: () => {
				// 			setSelectedRow(record);
				// 			setSelectedRowKeys([record.name]);
				// 		}
				// 	};
				// }}
				size="middle"
				pagination={false}
				{...option}
			/>
		</div>
	);
}
