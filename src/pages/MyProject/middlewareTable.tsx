import React, { useState } from 'react';
import { Radio, Search } from '@alicloud/console-components';
import { useHistory } from 'react-router';
import Table from '@/components/MidTable';
import { nullRender } from '@/utils/utils';
import { MiddlewareResourceInfo, MiddlewareTableProps } from './myProject';
import storage from '@/utils/storage';
import { api } from '@/api.json';
import nodata from '@/assets/images/nodata.svg';

const RadioGroup = Radio.Group;
export default function MiddlewareTable(
	props: MiddlewareTableProps
): JSX.Element {
	const { data } = props;
	const history = useHistory();
	const [dataSource, setDataSource] = useState<MiddlewareResourceInfo[]>(
		data.middlewareResourceInfoList
	);
	const [tableType, setTableType] = useState<string>('cpu');
	const handleSearch = (value: string) => {
		const list = data.middlewareResourceInfoList.filter(
			(item: MiddlewareResourceInfo) => item.name.includes(value)
		);
		setDataSource(list);
	};
	const Operation = {
		primary: (
			<div
				style={{
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					height: 40
				}}
			>
				<div>
					<img
						width={16}
						height={16}
						src={
							data.imagePath
								? `${api}/images/middleware/${data.imagePath}`
								: nodata
						}
						alt={data.aliasName}
					/>
				</div>
				<div
					style={{ marginLeft: 8 }}
					onClick={() => {
						storage.setSession(
							'menuPath',
							`/serviceList/${data.type}/${data.aliasName}`
						);
						history.push(
							`/serviceList/${data.type}/${data.aliasName}`
						);
					}}
				>
					{data.aliasName}
				</div>
			</div>
		),
		secondary: (
			<>
				<Search
					placeholder="请输入服务名称搜索"
					onSearch={handleSearch}
					style={{ width: '260px', marginRight: 8 }}
				/>
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
			</>
		)
	};
	const nameRender = (
		value: string,
		index: number,
		record: MiddlewareResourceInfo
	) => {
		return (
			<div style={{ maxWidth: '160px' }}>
				<div
					title={record.name}
					className="name-link text-overflow"
					onClick={() => {
						storage.setSession(
							'menuPath',
							`/serviceList/${data.type}/${data.aliasName}`
						);
						history.push(
							`/serviceList/${data.type}/${data.aliasName}/basicInfo/${record.name}/${record.type}/${record.chartVersion}/${record.namespace}`
						);
					}}
				>
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
		<div style={{ marginTop: 32, borderBottom: '1px solid #D1D5D9' }}>
			<Table
				dataSource={dataSource}
				exact
				primaryKey="key"
				operation={Operation}
				// search={{
				// 	onSearch: handleSearch,
				// 	placeholder: '请输入服务名称搜索'
				// }}
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
		</div>
	);
}
