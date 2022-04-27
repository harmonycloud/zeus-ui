import React, { useState, useEffect } from 'react';
import { Table, Button, Input } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table/interface';
import { ProTableProps } from './table';

const { Search } = Input;

const ProTable = (props: ProTableProps<unknown>) => {
	const {
		columns = [],
		children,
		dataSource,
		operation,
		showColumnSetting,
		showRefresh,
		pagination,
		onRefresh = () => {
			console.log('');
		},
		...tableProps
	} = props;
	const [visibleColumns, setVisibleColumns] = useState<ColumnsType[]>([]);

	return (
		<div className="zeus-pro-table">
			<div className="zeus-pro-table-operator-content"></div>
			<div className="zeus-pro-table-content">
				{/* <Table columns={visibleColumns} dataSource={} /> */}
			</div>
		</div>
	);
};
