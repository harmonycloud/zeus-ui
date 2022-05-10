import React, { useState } from 'react';
import { Radio, Input, RadioChangeEvent } from 'antd';
import { useHistory } from 'react-router';
import ProTable from '@/components/ProTable';
import { nullRender } from '@/utils/utils';
import { MiddlewareResourceInfo, MiddlewareTableProps } from './myProject';
import storage from '@/utils/storage';
import { api } from '@/api.json';
import nodata from '@/assets/images/nodata.svg';

const Search = Input.Search;
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
					allowClear={true}
					style={{ width: '260px', marginRight: 8 }}
				/>
				<RadioGroup
					// shape="button"
					value={tableType}
					onChange={(e: RadioChangeEvent) =>
						setTableType(e.target.value)
					}
				>
					<Radio.Button id="cpu" value="cpu">
						CPU
					</Radio.Button>
					<Radio.Button id="memory" value="memory">
						内存
					</Radio.Button>
					<Radio.Button id="storage" value="storage">
						存储
					</Radio.Button>
				</RadioGroup>
			</>
		)
	};
	const nameRender = (
		value: string,
		record: MiddlewareResourceInfo,
		index: number
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
	return (
		<div style={{ marginTop: 32, borderBottom: '1px solid #D1D5D9' }}>
			<ProTable
				dataSource={dataSource}
				// exact
				rowKey="name"
				operation={Operation}
				// search={{
				// 	onSearch: handleSearch,
				// 	placeholder: '请输入服务名称搜索'
				// }}
				// onSort={onSort}
			>
				<ProTable.Column
					title="服务名称/中文别名"
					dataIndex="name"
					render={nameRender}
					width={180}
				/>
				{tableType === 'cpu' && (
					<ProTable.Column
						title="CPU配额（核）"
						dataIndex="requestCpu"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.requestCpu - b.requestCpu}
					/>
				)}
				{tableType === 'cpu' && (
					<ProTable.Column
						title="近5min平均使用额（核）"
						dataIndex="per5MinCpu"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.per5MinCpu - b.per5MinCpu}
					/>
				)}
				{tableType === 'cpu' && (
					<ProTable.Column
						title="CPU使用率（%）"
						dataIndex="cpuRate"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.cpuRate - b.cpuRate}
					/>
				)}
				{tableType === 'memory' && (
					<ProTable.Column
						title="内存配额（GB）"
						dataIndex="requestMemory"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.requestMemory - b.requestMemory}
					/>
				)}
				{tableType === 'memory' && (
					<ProTable.Column
						title="近5min平均使用额（GB）"
						dataIndex="per5MinMemory"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.per5MinMemory - b.per5MinMemory}
						// sortable
					/>
				)}
				{tableType === 'memory' && (
					<ProTable.Column
						title="内存使用率（%）"
						dataIndex="memoryRate"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => Number(a.memoryRate) - Number(b.memoryRate)}
					/>
				)}
				{tableType === 'storage' && (
					<ProTable.Column
						title="存储配额（G）"
						dataIndex="requestStorage"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.requestStorage - b.requestStorage}
					/>
				)}
				{tableType === 'storage' && (
					<ProTable.Column
						title="近5min平均使用额（%）"
						dataIndex="per5MinStorage"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.per5MinStorage - b.per5MinStorage}
					/>
				)}
				{tableType === 'storage' && (
					<ProTable.Column
						title="存储使用率（%）"
						dataIndex="storageRate"
						render={nullRender}
						width={200}
						sorter={(
							a: MiddlewareResourceInfo,
							b: MiddlewareResourceInfo
						) => a.storageRate - b.storageRate}
						// sortable
					/>
				)}
			</ProTable>
		</div>
	);
}
