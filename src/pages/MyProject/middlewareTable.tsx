import React, { useState } from 'react';
import { Radio } from '@alicloud/console-components';
import Table from '@/components/MidTable';
import { nullRender, iconTypeRender } from '@/utils/utils';

const RadioGroup = Radio.Group;
export default function MiddlewareTable(): JSX.Element {
	const [dataSource, setDataSource] = useState([]);
	const [tableType, setTableType] = useState<string>('cpu');
	const Operation = {
		primary: <span>mysql</span>,
		secondary: (
			<RadioGroup
				shape="button"
				value={tableType}
				onChange={(value: string | number | boolean) =>
					setTableType(value as string)
				}
			>
				<Radio id="cpu" value="cpu">
					CPU
				</Radio>
				<Radio id="memory" value="memory">
					内存
				</Radio>
				<Radio id="storage" value="storage">
					存储
				</Radio>
			</RadioGroup>
		)
	};
	const handleSearch = (value: string) => {
		console.log(value);
	};
	const nameRender = (value: string, index: number, record: any) => {
		return (
			<div style={{ maxWidth: '160px' }}>
				<div title={record.name} className="text-overflow">
					{record.name}
				</div>
				<div title={record.aliasName} className="text-overflow">
					{record.aliasName}
				</div>
			</div>
		);
	};
	const onSort = (dataIndex: string, order: string) => {
		const temp = dataSource.sort(function (a, b) {
			const result = a[dataIndex] - b[dataIndex];
			return order === 'asc'
				? result > 0
					? 1
					: -1
				: result > 0
				? -1
				: 1;
		});
		setDataSource([...temp]);
	};
	return (
		<Table
			dataSource={dataSource}
			exact
			primaryKey="key"
			operation={Operation}
			fixedHeader={true}
			// maxBodyHeight="280px"
			search={{
				onSearch: handleSearch,
				placeholder: '请输入服务名称搜索'
			}}
			onSort={onSort}
		>
			<Table.Column
				title="服务名称/中文别名"
				dataIndex="name"
				cell={nameRender}
				width={180}
			/>
			{tableType === 'cpu' && (
				<Table.Column
					title="CPU配额（核）"
					dataIndex="requestCpu"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'cpu' && (
				<Table.Column
					title="近5min平均使用额（核）"
					dataIndex="per5MinCpu"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'cpu' && (
				<Table.Column
					title="CPU使用率（%）"
					dataIndex="cpuRate"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'memory' && (
				<Table.Column
					title="内存配额（GB）"
					dataIndex="requestMemory"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'memory' && (
				<Table.Column
					title="近5min平均使用额（GB）"
					dataIndex="per5MinMemory"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'memory' && (
				<Table.Column
					title="内存使用率（%）"
					dataIndex="memoryRate"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'storage' && (
				<Table.Column
					title="存储配额（G）"
					dataIndex="requestStorage"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'storage' && (
				<Table.Column
					title="近5min平均使用额（%）"
					dataIndex="per5MinStorage"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
			{tableType === 'storage' && (
				<Table.Column
					title="存储使用率（%）"
					dataIndex="storageRate"
					cell={nullRender}
					width={200}
					sortable
				/>
			)}
		</Table>
	);
}
