import { Button, Space, Table } from 'antd';
import React, { useState } from 'react';
import EditableRow from './EditableRow';
import { EditableCell } from './EditableCell';
import './index.scss';
// ! 所有使用EditTable的组件，dataSource中必须有唯一key值；
interface EditTableProps {
	defaultColumns: any;
	originData: any;
	basicData: any;
}
function swapArray(arr: any[], index1: number, index2: number) {
	arr[index1] = arr.splice(index2, 1, arr[index1])[0];
	return arr;
}
function zIndexDown(arr: any[], index: number, length: number) {
	if (index + 1 != length) {
		swapArray(arr, index, index + 1);
	}
}
function zIndexUp(arr: any[], index: number) {
	if (index != 0) {
		swapArray(arr, index, index - 1);
	}
}
export default function EditTable(props: EditTableProps): JSX.Element {
	const { defaultColumns, originData, basicData } = props;
	console.log(defaultColumns, originData);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [dataSource, setDataSource] = useState([...originData]);
	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell
		}
	};
	const handleAdd = () => {
		setDataSource([...dataSource, basicData]);
	};
	const handleSave = (row: any) => {
		const newData = [...dataSource];
		const index = newData.findIndex((item) => row.key === item.key);
		const item = newData[index];
		newData.splice(index, 1, {
			...item,
			...row
		});
		setDataSource(newData);
	};
	const moveUp = (key: React.Key) => {
		const newData = [...dataSource];
		const index = newData.findIndex((item) => item.key === key);
		zIndexUp(newData, index);
		setDataSource(newData);
	};
	const moveDown = (key: React.Key) => {
		const newData = [...dataSource];
		const index = newData.findIndex((item) => item.key === key);
		zIndexDown(newData, index, newData.length);
		setDataSource(newData);
	};
	const insertion = (key: React.Key) => {
		const newData = [...dataSource];
		const index = newData.findIndex((item) => item.key === key);
		newData.splice(index + 1, 0, basicData);
		setSelectedRowKeys([basicData.key]);
		setDataSource(newData);
	};
	const handleDelete = (key: React.Key) => {
		const newData = dataSource.filter((item) => item.key !== key);
		setDataSource(newData);
	};
	const tableColumns = defaultColumns.map((col: any) => {
		if (!col.editable) {
			return col;
		}
		return {
			...col,
			onCell: (record: any) => ({
				record,
				editable: col.editable,
				dataIndex: col.dataIndex,
				title: col.title,
				handleSave
			})
		};
	});
	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);
	};
	const selectRow = (record: any) => {
		let selectedRowKeysTemp = [...selectedRowKeys];
		if (selectedRowKeysTemp.indexOf(record.key) >= 0) {
			selectedRowKeysTemp.splice(
				selectedRowKeysTemp.indexOf(record.key),
				1
			);
		} else {
			selectedRowKeysTemp = [record.key];
		}
		setSelectedRowKeys(selectedRowKeysTemp);
	};
	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange
	};
	return (
		<div id="zeus-edit-table">
			<Space className="mb-8">
				<Button size="small" onClick={handleAdd} type="primary">
					新增
				</Button>
				<Button
					size="small"
					onClick={() => {
						setSelectedRowKeys([]);
						handleDelete(selectedRowKeys[0]);
					}}
				>
					删除
				</Button>
				<Button onClick={() => moveUp(selectedRowKeys[0])} size="small">
					上移
				</Button>
				<Button
					onClick={() => moveDown(selectedRowKeys[0])}
					size="small"
				>
					下移
				</Button>
				<Button
					size="small"
					onClick={() => insertion(selectedRowKeys[0])}
				>
					插入
				</Button>
			</Space>
			<Table
				className="mb-8"
				size="small"
				components={components}
				rowClassName={() => 'editable-row'}
				bordered
				dataSource={dataSource}
				rowSelection={{
					type: 'radio',
					renderCell(value, record, index, originNode) {
						return null;
					},
					...rowSelection
				}}
				rowKey="key"
				columns={tableColumns}
				pagination={false}
				onRow={(record) => ({
					onClick: () => selectRow(record)
				})}
			/>
			<Space>
				<Button
					size="small"
					type="primary"
					onClick={() => {
						console.log(dataSource);
					}}
				>
					保存
				</Button>
				<Button size="small">取消</Button>
			</Space>
		</div>
	);
}
