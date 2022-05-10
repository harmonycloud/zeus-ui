import React, { useState, useEffect } from 'react';
import { Table, Button, Input } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';

import ColumnsModal from './columnsModal';

import { ColumnsType, ColumnType } from 'antd/lib/table/interface';
import { ProTableProps } from './table';
import './index.scss';

const { Search } = Input;
const translateChildrenToColumns = (value: React.ReactNode[]) => {
	const list = value
		.filter((item: any) => item?.type?.name === 'Column')
		.map((item: any) => {
			return item.props;
		});
	return list;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/ban-types
function ProTable<T extends object>(props: ProTableProps<T>): JSX.Element {
	const {
		columns = [],
		children,
		dataSource,
		operation,
		showColumnSetting,
		showRefresh,
		onRefresh = () => {
			console.log('');
		},
		search,
		...tableProps
	} = props;
	const [showColumnDialog, setShowColumnDialog] = useState<boolean>(false); // 展示column列表
	const [tableColumns, setTableColumns] = useState<ColumnsType<T>>(columns);
	const [visibleColumns, setVisibleColumns] =
		useState<ColumnsType<T>>(columns);
	useEffect(() => {
		if (children) {
			const list = translateChildrenToColumns(children);
			setTableColumns(list);
			setVisibleColumns(list);
		}
	}, [children]);
	const columnsSet = (columns: ColumnsType<T>) => {
		setVisibleColumns(columns);
		setShowColumnDialog(false);
	};
	const columnsRender = () => {
		return visibleColumns.map((item: ColumnType<T>, index: number) => (
			<Table.Column {...item} key={index} />
		));
	};
	return (
		<div className="zeus-pro-table">
			<div className="zeus-pro-table-operator-content">
				<div className="zeus-pro-table-operator-left">
					{operation?.primary}
					{search && <Search allowClear {...search} />}
				</div>
				<div className="zeus-pro-table-operator-right">
					{operation?.secondary}
					{showColumnSetting && (
						<Button
							type="default"
							icon={<SettingOutlined />}
							onClick={() => setShowColumnDialog(true)}
						/>
					)}
					{showRefresh && (
						<Button
							type="default"
							icon={<ReloadOutlined />}
							onClick={onRefresh}
						/>
					)}
				</div>
			</div>
			<div className="zeus-pro-table-content">
				<Table size="middle" {...tableProps} dataSource={dataSource}>
					{columnsRender()}
				</Table>
			</div>
			{showColumnDialog && (
				<ColumnsModal
					visible={showColumnDialog}
					onCancel={() => setShowColumnDialog(false)}
					onOk={columnsSet}
					columns={tableColumns}
					defaultColumns={visibleColumns}
				/>
			)}
		</div>
	);
}
ProTable.Column = Table.Column;
ProTable.ColumnGroup = Table.ColumnGroup;
ProTable.Summary = Table.Summary;
export default ProTable;
