import React, { useState, useEffect } from 'react';
import { Pagination, Button, Icon, Search } from '@alicloud/console-components';
import Table from '@alicloud/console-components-table';
import ColumnDialog from './columnDialog';
import { MidTableProps } from './midTable';
import './index.scss';

function getDataByPageInfo(list: any[], { current = 1, pageSize = 10 } = {}) {
	return list.slice((current - 1) * pageSize, current * pageSize);
}

function translateChildrenToColumns(children: any): any[] {
	const list: any[] = [];
	children.forEach((item: any) => {
		if (item) {
			if (item.type.displayName === 'Column') {
				list.push(item.props);
			}
		}
	});
	return list;
}

const MidTable = (props: MidTableProps) => {
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
		searchStyle = {},
		...tableProps
	} = props;

	const [showColumnDialog, setShowColumnDialog] = useState(false); // 展示column列表
	const [tableColumns, setTableColumns] = useState(columns); // 表格的column
	const [visibleTableColumns, setVisibleTableColumns] = useState(columns); // 表格展示的column
	const [columnLock, setColumnLock] = useState(false); // 锁定column
	const [pageInfo, setPageInfo] = useState({
		current: 1,
		pageSize: 10,
		total: 10
	}); //分页
	const [tableDatas, setTableDatas] = useState(
		getDataByPageInfo(dataSource, pageInfo)
	);
	// column发生变化并且column没有被锁住，更新column
	useEffect(() => {
		if (columns && !columnLock) {
			setTableColumns(columns);
			setVisibleTableColumns(columns);
		}
	}, [columns.length]);

	// children发生变化并且column没有被锁住，更新children
	useEffect(() => {
		if (children && !columnLock) {
			const list = translateChildrenToColumns(children);
			setTableColumns(list);
			setVisibleTableColumns(list);
		}
	}, [children]);

	useEffect(() => {
		setPageInfo({ ...pageInfo, current: 1, total: dataSource.length });
		setTableDatas(getDataByPageInfo(dataSource, pageInfo));
	}, [dataSource]);

	// 监听外部分页信息
	useEffect(() => {
		setPageInfo(pagination);
	}, [pagination]);

	// 监听分页数据变化
	useEffect(() => {
		setTableDatas(getDataByPageInfo(dataSource, pageInfo));
	}, [pageInfo]);
	// 设置展示的column
	const setColumns = (columns: any) => {
		setVisibleTableColumns(columns);
		setColumnLock(true);
		setShowColumnDialog(false);
	};
	const onPageChange = (current: number) => {
		setPageInfo({ ...pageInfo, current });
	};
	const onPageSizeChange = (pageSize: number) => {
		setPageInfo({ ...pageInfo, current: 1, pageSize });
	};

	const renderRightOperation = () => {
		return (
			<div className="operation-right">
				{operation && operation.secondary}
				{showColumnSetting && (
					<Button onClick={() => setShowColumnDialog(true)}>
						<Icon type="set" />
					</Button>
				)}
				{showRefresh && (
					<Button onClick={onRefresh}>
						<Icon type="refresh" />
					</Button>
				)}
			</div>
		);
	};
	const tableOperation = { ...operation, secondary: renderRightOperation };
	const renderCols = () => {
		return visibleTableColumns.map((col, i) => {
			return <Table.Column {...col} key={i} />;
		});
	};

	return (
		<div className="istio-table">
			<Table
				dataSource={tableDatas}
				operation={tableOperation}
				{...tableProps}
				search={
					tableProps.search ? (
						<div>
							<Search
								{...tableProps.search}
								style={
									JSON.stringify(searchStyle) === '{}'
										? { width: '260px' }
										: searchStyle
								}
								hasClear={true}
							/>
						</div>
					) : null
				}
			>
				{renderCols()}
			</Table>
			<Pagination
				{...pageInfo}
				total={dataSource.length}
				onPageSizeChange={onPageSizeChange}
				onChange={onPageChange}
				hideOnlyOnePage={true}
			/>
			<ColumnDialog
				visible={showColumnDialog}
				onConfirm={setColumns}
				columns={tableColumns}
				defaultSelected={visibleTableColumns}
				onCancel={() => setShowColumnDialog(false)}
			/>
		</div>
	);
};

MidTable.Column = Table.Column;
MidTable.ColumnGroup = Table.ColumnGroup;
MidTable.GroupHeader = Table.GroupHeader;
MidTable.GroupFooter = Table.GroupFooter;

export default MidTable;
