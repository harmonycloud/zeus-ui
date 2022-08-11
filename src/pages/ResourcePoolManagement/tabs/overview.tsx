import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import moment from 'moment';
import { Radio, notification, Tooltip, RadioChangeEvent } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import ProTable from '@/components/ProTable';
import FormBlock from '@/components/FormBlock';
import { IconFont } from '@/components/IconFont';
import {
	iconTypeRender,
	nullRender,
	objectRemoveDuplicatesByKey
} from '@/utils/utils';
import {
	getMiddlewareResource,
	getNodeResource,
	getNamespaceResource,
	getClusterCpuAndMemory
} from '@/services/common';
import transBg from '@/assets/images/trans-bg.svg';
import { paramsProps } from '../detail';
import {
	NodeResourceProps,
	MiddlewareResourceProps,
	ClusterQuotaDTO
} from '../resource.pool';
import { FiltersProps } from '@/types/comment';
// * E charts v5
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import {
	GridComponent,
	TooltipComponent,
	TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { getGaugeOption } from '@/utils/echartsOption';

// Register the required components
echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	GaugeChart,
	CanvasRenderer
]);
const Overview = () => {
	const [viewType, setViewType] = useState<string>('service');
	const [tableType, setTableType] = useState<string>('cpu');
	const [originData, setOriginData] = useState<MiddlewareResourceProps[]>([]);
	const [dataSource, setDataSource] = useState<MiddlewareResourceProps[]>([]);
	const [nodeDataSource, setNodeDataSource] = useState<NodeResourceProps[]>(
		[]
	);
	const [clusterQuota, setClusterQuota] = useState<ClusterQuotaDTO>();
	const [option1, setOption1] = useState(getGaugeOption(0, 'CPU(核)'));
	const [option2, setOption2] = useState(getGaugeOption(0, '内存(GB)'));
	const [namespaceFilter, setNamespaceFilter] = useState<FiltersProps[]>([]);
	const [typeFilter, setTypeFilter] = useState<FiltersProps[]>([]);

	const params: paramsProps = useParams();
	const { id } = params;
	useEffect(() => {
		let mounted = true;
		getMiddlewareResource({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
					setOriginData(res.data);
					setDataSource(res.data);
					setNamespaceFilter(
						objectRemoveDuplicatesByKey(
							res.data.map((item: MiddlewareResourceProps) => {
								return {
									text: item.namespace,
									value: item.namespace
								};
							}),
							'value'
						)
					);
					setTypeFilter(
						objectRemoveDuplicatesByKey(
							res.data.map((item: MiddlewareResourceProps) => {
								return {
									text: item.type,
									value: item.type
								};
							}),
							'value'
						)
					);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		getNodeResource({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
					setNodeDataSource(res.data);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		getClusterCpuAndMemory({ clusterId: id }).then((res) => {
			if (res.success) {
				setClusterQuota(res.data || {});
				const cpuRate = res.data
					? Number(res.data?.usedCpu) / Number(res.data?.totalCpu)
					: 0;
				const option1Temp = getGaugeOption(cpuRate, 'CPU(核)');
				setOption1(option1Temp);
				const memoryRate = res.data
					? Number(res.data?.usedMemory) /
					  Number(res.data?.totalMemory)
					: 0;
				const option2Temp = getGaugeOption(memoryRate, '内存(GB)');
				setOption2(option2Temp);
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	const getMiddleware = () => {
		getMiddlewareResource({ clusterId: id }).then((res) => {
			if (res.success) {
				setOriginData(res.data);
				setDataSource(res.data);
				setNamespaceFilter(
					objectRemoveDuplicatesByKey(
						res.data.map((item: MiddlewareResourceProps) => {
							return {
								label: item.namespace,
								value: item.namespace
							};
						}),
						'value'
					)
				);
			} else {
				setDataSource([]);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const getNamespace = () => {
		getNamespaceResource({ clusterId: id }).then((res) => {
			if (res.success) {
				const list = res.data.map((item: MiddlewareResourceProps) => {
					return {
						namespace: item.name,
						requestCpu: item.cpuRequest,
						per5MinCpu: item.per5MinCpu,
						cpuRate: item.cpuRate,
						requestMemory: item.memoryRequest,
						per5MinMemory: item.per5MinMemory,
						memoryRate: item.memoryRate,
						requestStorage: item.pvcRequest,
						per5MinStorage: item.per5MinPvc,
						storageRate: item.pvcRate
					};
				});
				setNamespaceFilter(
					objectRemoveDuplicatesByKey(
						res.data.map((item: MiddlewareResourceProps) => {
							return {
								label: item.name,
								value: item.name
							};
						}),
						'value'
					)
				);
				setOriginData(list);
				setDataSource(list);
			} else {
				setDataSource([]);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onViewChange = (value: string | number | boolean, type: string) => {
		if (type === 'view') {
			setViewType(value as string);
			if (value === 'service') {
				getMiddleware();
			} else {
				getNamespace();
			}
		} else {
			setTableType(value as string);
		}
	};
	const nameRender = (
		value: string,
		record: MiddlewareResourceProps,
		index: number
	) => {
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
	const statusRender = (value: string) => {
		if (value === 'True') {
			return (
				<>
					<CheckCircleFilled style={{ color: '#00A700' }} /> 成功
				</>
			);
		} else {
			return (
				<>
					<CloseCircleFilled style={{ color: '#C80000' }} /> 失败
				</>
			);
		}
	};
	const cpuRender = (
		value: string,
		record: NodeResourceProps,
		index: number
	) => {
		const percentage = record.cpuRate ? Number(record.cpuRate) : 0;
		return (
			<div>
				<div className="cpu-content">
					<img src={transBg} />
					<div className="cpu-content-line">
						<div
							style={{
								height: 16,
								width: `${percentage}%`,
								backgroundImage:
									'linear-gradient(to right bottom, rgb(127, 177, 255), rgb(122, 212, 255))'
							}}
						></div>
					</div>
					<div style={{ color: '#49A9E1' }}>
						{percentage.toFixed(0)}%
					</div>
				</div>
				<div>
					{record.cpuRate ? Number(record.cpuUsed).toFixed(1) : '-'}/
					{record.cpuTotal ? Number(record.cpuTotal).toFixed(1) : '-'}
				</div>
			</div>
		);
	};
	const memoryRender = (
		value: string,
		record: NodeResourceProps,
		index: number
	) => {
		const percentage = record.memoryRate ? Number(record.memoryRate) : 0;
		return (
			<div>
				<div className="cpu-content">
					<img src={transBg} />
					<div className="cpu-content-line">
						<div
							style={{
								height: 16,
								width: `${percentage}%`,
								backgroundImage:
									'linear-gradient(to right bottom, rgb(248, 163, 89), rgb(252, 201, 116))'
							}}
						></div>
					</div>
					<div style={{ color: '#F8A359' }}>
						{percentage.toFixed(0)}%
					</div>
				</div>
				<div>
					{record.memoryUsed
						? Number(record.memoryUsed).toFixed(1)
						: '-'}
					/
					{record.memoryTotal
						? Number(record.memoryTotal).toFixed(1)
						: '-'}
				</div>
			</div>
		);
	};
	const Operation = {
		primary: (
			<Radio.Group
				value={viewType}
				onChange={(e: RadioChangeEvent) =>
					onViewChange(e.target.value, 'view')
				}
			>
				<Radio.Button id="service" value="service">
					<Tooltip title="服务视角">
						<IconFont type="icon-shili1" />
					</Tooltip>
				</Radio.Button>
				<Radio.Button id="namespace" value="namespace">
					<Tooltip title="命名空间视角">
						<IconFont type="icon-mingmingkongjian" />
					</Tooltip>
				</Radio.Button>
			</Radio.Group>
		),
		secondary: (
			<Radio.Group
				value={tableType}
				onChange={(e: RadioChangeEvent) =>
					onViewChange(e.target.value, 'table')
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
			</Radio.Group>
		)
	};
	const NodeOperation = {
		primary: (
			<div className="node-title-content">
				<div className="node-title-name">节点信息</div>
			</div>
		)
	};
	const handleSearch = (value: string) => {
		const list = originData.filter((item: MiddlewareResourceProps) =>
			item.name.includes(value)
		);
		setDataSource(list);
	};
	return (
		<div>
			<FormBlock title="资源信息" className="resource-pool-info">
				<div className="resource-pool-gauge-content">
					<div className="resource-pool-gauge-item">
						<ReactEChartsCore
							echarts={echarts}
							option={option1}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: 'calc(100% - 360px)'
							}}
						/>
						<div className="resource-pool-gauge-info">
							总容量：
							{(Number(clusterQuota?.totalCpu) || 0).toFixed(2)}核
							| 已使用：
							{(Number(clusterQuota?.usedCpu) || 0).toFixed(2)}核
							| 剩余容量：
							{(
								(Number(clusterQuota?.totalCpu) || 0) -
									Number(clusterQuota?.usedCpu) || 0
							).toFixed(2) || 0}
							核
						</div>
					</div>
					<div className="resource-pool-gauge-item">
						<ReactEChartsCore
							echarts={echarts}
							option={option2}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: 'calc(100% - 360px)'
							}}
						/>
						<div className="resource-pool-gauge-info">
							总容量：
							{(Number(clusterQuota?.totalMemory) || 0).toFixed(
								2
							)}
							GB | 已使用：
							{(Number(clusterQuota?.usedMemory) || 0).toFixed(2)}
							GB | 剩余容量：
							{(
								(Number(clusterQuota?.totalMemory) || 0) -
									Number(clusterQuota?.usedMemory) || 0
							).toFixed(2)}
							GB
						</div>
					</div>
				</div>
				<div className="resource-pool-table-content">
					<ProTable
						dataSource={dataSource}
						rowKey={(record) =>
							`${record.name}/${record.namespace}`
						}
						operation={Operation}
						scroll={{
							y: '280px'
						}}
						search={
							viewType === 'service'
								? {
										onSearch: handleSearch,
										placeholder: '请输入服务名称搜索'
								  }
								: null
						}
						pagination={{
							hideOnSinglePage: true
						}}
					>
						<ProTable.Column
							title="命名空间"
							dataIndex="namespace"
							filters={namespaceFilter}
							filterMultiple={false}
							width={200}
							fixed="left"
							onFilter={(
								value: string | number | boolean,
								record: MiddlewareResourceProps
							) => {
								return record.namespace === value;
							}}
						/>
						{viewType === 'service' && (
							<ProTable.Column
								title="类型"
								dataIndex="type"
								render={iconTypeRender}
								filters={typeFilter}
								filterMultiple={false}
								width={180}
								onFilter={(
									value: string | number | boolean,
									record: MiddlewareResourceProps
								) => {
									return record.type === value;
								}}
							/>
						)}
						{viewType === 'service' && (
							<ProTable.Column
								title="服务名称/中文别名"
								dataIndex="name"
								render={nameRender}
								width={180}
							/>
						)}
						{tableType === 'cpu' && (
							<ProTable.Column
								title="CPU配额（核）"
								dataIndex="requestCpu"
								render={nullRender}
								width={200}
								sorter={(
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
								) => (a.requestCpu || 0) - (b.requestCpu || 0)}
							/>
						)}
						{tableType === 'cpu' && (
							<ProTable.Column
								title="近5min平均使用额（核）"
								dataIndex="per5MinCpu"
								render={nullRender}
								width={200}
								sorter={(
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
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
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
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
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
								) =>
									(a.requestMemory || 0) -
									(b.requestMemory || 0)
								}
							/>
						)}
						{tableType === 'memory' && (
							<ProTable.Column
								title="近5min平均使用额（GB）"
								dataIndex="per5MinMemory"
								render={nullRender}
								width={200}
								sorter={(
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
								) => a.per5MinMemory - b.per5MinMemory}
							/>
						)}
						{tableType === 'memory' && (
							<ProTable.Column
								title="内存使用率（%）"
								dataIndex="memoryRate"
								render={nullRender}
								width={200}
								sorter={(
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
								) => a.memoryRate - b.memoryRate}
							/>
						)}
						{tableType === 'storage' && (
							<ProTable.Column
								title="存储配额（G）"
								dataIndex="requestStorage"
								render={nullRender}
								width={200}
								sorter={(
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
								) =>
									(a.requestStorage || 0) -
									(b.requestStorage || 0)
								}
								// sortable
							/>
						)}
						{tableType === 'storage' && (
							<ProTable.Column
								title="近5min平均使用额（%）"
								dataIndex="per5MinStorage"
								render={nullRender}
								width={200}
								sorter={(
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
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
									a: MiddlewareResourceProps,
									b: MiddlewareResourceProps
								) => a.storageRate - b.storageRate}
							/>
						)}
					</ProTable>
				</div>
			</FormBlock>
			<div>
				<ProTable
					dataSource={nodeDataSource}
					rowKey="ip"
					operation={NodeOperation}
				>
					<ProTable.Column title="节点IP" dataIndex="ip" />
					<ProTable.Column
						title="CPU(核)"
						dataIndex="cpuRate"
						render={cpuRender}
						sorter={(a: NodeResourceProps, b: NodeResourceProps) =>
							(a.cpuRate || 0) - (b.cpuRate || 0)
						}
					/>
					<ProTable.Column
						title="内存(GB)"
						dataIndex="memoryRate"
						render={memoryRender}
						sorter={(a: NodeResourceProps, b: NodeResourceProps) =>
							a.memoryRate - b.memoryRate
						}
					/>
					<ProTable.Column
						title="状态"
						dataIndex="status"
						render={statusRender}
						filterMultiple={false}
						filters={[
							{ text: '成功', value: 'True' },
							{ text: '失败', value: 'False' }
						]}
						onFilter={(
							value: string | number | boolean,
							record: NodeResourceProps
						) => {
							return record.status === value;
						}}
					/>
					<ProTable.Column
						title="创建时间"
						dataIndex="createTime"
						sorter={(a: NodeResourceProps, b: NodeResourceProps) =>
							moment(a.createTime).unix() -
							moment(b.createTime).unix()
						}
					/>
				</ProTable>
			</div>
		</div>
	);
};
export default Overview;
