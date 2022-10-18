import { Button, Divider, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import EditableRow from './EditableRow';
import { EditableCell } from './EditableCell';
import './index.scss';
// ! 所有使用EditTable的组件，dataSource中必须有唯一key值；
interface EditTableProps {
	defaultColumns: any;
	originData: any;
	basicData: any;
	moveUpVisible?: boolean;
	moveDownVisible?: boolean;
	incrementVisible?: boolean;
	returnValues?: (values: any) => void;
	changedData?: any;
	[propName: string]: any;
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
	const {
		defaultColumns,
		originData,
		basicData,
		moveUpVisible,
		moveDownVisible,
		incrementVisible,
		returnValues,
		changedData,
		...resTableProps
	} = props;
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [dataSource, setDataSource] = useState([...originData]);
	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell
		}
	};
	useEffect(() => {
		if (changedData) {
			console.log(changedData);
			const newData = [...dataSource];
			const index = [...dataSource].findIndex(
				(item) => item.key === selectedRowKeys[0]
			);
			const item = dataSource[index];
			newData.splice(index, 1, {
				...item,
				...changedData
			});
			setDataSource([...newData]);
		}
	}, [changedData]);
	const handleAdd = () => {
		const tempData = {
			...basicData,
			key: Math.random() * 1000000
		};
		setDataSource([...dataSource, tempData]);
		setSelectedRowKeys([tempData.key]);
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
		returnValues && returnValues(newData);
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
		const tempData = {
			...basicData,
			key: Math.random() * 1000000
		};
		const newData = [...dataSource];
		const index = newData.findIndex((item) => item.key === key);
		newData.splice(index + 1, 0, tempData);
		setSelectedRowKeys([tempData.key]);
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
				colType: col.componentType,
				checked: record.key === selectedRowKeys[0],
				options:
					col.componentType === 'select' ? col.selectOptions : [],
				handleSave
			}),
			width: col.width
		};
	});
	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);
	};
	const selectRow = (record: any) => {
		let selectedRowKeysTemp = [...selectedRowKeys];
		// * 选择当前取消选择
		// if (selectedRowKeysTemp.indexOf(record.key) >= 0) {
		// 	selectedRowKeysTemp.splice(
		// 		selectedRowKeysTemp.indexOf(record.key),
		// 		1
		// 	);
		// } else {
		selectedRowKeysTemp = [record.key];
		// }
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
				{moveUpVisible && (
					<Button
						onClick={() => moveUp(selectedRowKeys[0])}
						size="small"
					>
						上移
					</Button>
				)}
				{moveDownVisible && (
					<Button
						onClick={() => moveDown(selectedRowKeys[0])}
						size="small"
					>
						下移
					</Button>
				)}
				{incrementVisible && (
					<Button
						size="small"
						onClick={() => insertion(selectedRowKeys[0])}
					>
						插入
					</Button>
				)}
			</Space>
			<Table
				className="mb-8"
				size="small"
				components={components}
				rowClassName={() => 'editable-row'}
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
				{...resTableProps}
			/>
		</div>
	);
}
