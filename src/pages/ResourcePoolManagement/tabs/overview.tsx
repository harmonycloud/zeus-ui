import React, { useEffect, useState } from 'react';
import { Radio, Balloon, Message, Icon } from '@alicloud/console-components';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import FormBlock from '@/pages/ServiceCatalog/components/FormBlock';
import CustomIcon from '@/components/CustomIcon';
import { iconTypeRender, nullRender } from '@/utils/utils';
import { paramsProps } from '../detail';
import {
	getMiddlewareResource,
	getNodeResource,
	getNamespaceResource,
	getCluster
} from '@/services/common';
import messageConfig from '@/components/messageConfig';
import transBg from '@/assets/images/trans-bg.svg';
import {
	NodeResourceProps,
	MiddlewareResourceProps,
	ClusterQuotaDTO
} from '../resource.pool';
import { filtersProps } from '@/types/comment';
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
const RadioGroup = Radio.Group;
const Tooltip = Balloon.Tooltip;
const Overview = () => {
	const [viewType, setViewType] = useState<string>('service');
	const [tableType, setTableType] = useState<string>('cpu');
	const [originData, setOriginData] = useState<MiddlewareResourceProps[]>([]);
	const [dataSource, setDataSource] = useState<MiddlewareResourceProps[]>([]);
	const [nodeOriginData, setNodeOriginData] = useState<NodeResourceProps[]>(
		[]
	);
	const [nodeDataSource, setNodeDataSource] = useState<NodeResourceProps[]>(
		[]
	);
	const [clusterQuota, setClusterQuota] = useState<ClusterQuotaDTO>();
	const [option1, setOption1] = useState(getGaugeOption(0, 'CPU(核)'));
	const [option2, setOption2] = useState(getGaugeOption(0, '内存(GB)'));
	const [namespaceFilter, setNamespaceFilter] = useState<filtersProps[]>([]);
	const [typeFilter, setTypeFilter] = useState<filtersProps[]>([]);

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
						res.data.map((item: MiddlewareResourceProps) => {
							return {
								label: item.namespace,
								value: item.namespace
							};
						})
					);
					setTypeFilter(
						res.data.map((item: MiddlewareResourceProps) => {
							return {
								label: item.type,
								value: item.type
							};
						})
					);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		getNodeResource({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
					setNodeOriginData(res.data);
					setNodeDataSource(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		getCluster({ clusterId: id, detail: true }).then((res) => {
			if (res.success) {
				setClusterQuota(res.data.clusterQuotaDTO || {});
				const cpuRate = res.data.clusterQuotaDTO
					? Number(res.data.clusterQuotaDTO?.usedCpu) /
					  Number(res.data.clusterQuotaDTO?.totalCpu)
					: 0;
				const option1Temp = getGaugeOption(cpuRate, 'CPU(核)');
				setOption1(option1Temp);
				const memoryRate = res.data.clusterQuotaDTO
					? Number(res.data.clusterQuotaDTO?.usedMemory) /
					  Number(res.data.clusterQuotaDTO?.totalMemory)
					: 0;
				const option2Temp = getGaugeOption(memoryRate, '内存(GB)');
				setOption2(option2Temp);
			} else {
				Message.show(messageConfig('error', '失败', res));
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
					res.data.map((item: MiddlewareResourceProps) => {
						return {
							label: item.namespace,
							value: item.namespace
						};
					})
				);
			} else {
				setDataSource([]);
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const getNode = () => {
		getNodeResource({ clusterId: id }).then((res) => {
			if (res.success) {
				setNodeOriginData(res.data);
				setNodeDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
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
						memoryRate: item.memoryRate
					};
				});
				setNamespaceFilter(
					res.data.map((item: MiddlewareResourceProps) => {
						return {
							label: item.name,
							value: item.name
						};
					})
				);
				setOriginData(list);
				setDataSource(list);
			} else {
				setDataSource([]);
				Message.show(messageConfig('error', '失败', res));
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
		index: number,
		record: MiddlewareResourceProps
	) => {
		return (
			<div style={{ maxWidth: '160px' }}>
				<div className="name-link text-overflow">{record.name}</div>
				<div className="text-overflow">{record.aliasName}</div>
			</div>
		);
	};
	const statusRender = (
		value: string,
		index: number,
		record: NodeResourceProps
	) => {
		if (value === 'True') {
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					成功
				</>
			);
		} else {
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					失败
				</>
			);
		}
	};
	const cpuRender = (
		value: string,
		index: number,
		record: NodeResourceProps
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
		index: number,
		record: NodeResourceProps
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
			<RadioGroup
				shape="button"
				value={viewType}
				onChange={(value: string | number | boolean) =>
					onViewChange(value, 'view')
				}
			>
				<Tooltip
					trigger={
						<Radio id="service" value="service">
							<CustomIcon type="icon-shili1" size="small" />
						</Radio>
					}
					align="t"
				>
					服务视角
				</Tooltip>
				<Tooltip
					trigger={
						<Radio id="namespace" value="namespace">
							<CustomIcon
								type="icon-mingmingkongjian"
								size="small"
							/>
						</Radio>
					}
					align="t"
				>
					资源分区视角
				</Tooltip>
			</RadioGroup>
		),
		secondary: (
			<RadioGroup
				shape="button"
				value={tableType}
				onChange={(value: string | number | boolean) =>
					onViewChange(value, 'table')
				}
			>
				<Radio id="cpu" value="cpu">
					CPU
				</Radio>
				<Radio id="memory" value="memory">
					内存
				</Radio>
			</RadioGroup>
		)
	};
	const NodeOperation = {
		primary: (
			<div className="node-title-content">
				<div className="node-title-name">节点信息</div>
			</div>
		)
	};
	const onNodeSort = (dataIndex: string, order: string) => {
		const temp = nodeDataSource.sort(function (
			a: NodeResourceProps,
			b: NodeResourceProps
		) {
			const result = a[dataIndex] - b[dataIndex];
			return order === 'asc'
				? result > 0
					? 1
					: -1
				: result > 0
				? -1
				: 1;
		});
		setNodeDataSource([...temp]);
	};
	const onNodeFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = nodeOriginData.filter(
				(item: NodeResourceProps) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setNodeDataSource(list);
		} else {
			setNodeDataSource(nodeOriginData);
		}
	};
	const onSort = (dataIndex: string, order: string) => {
		const temp = originData.sort(function (
			a: MiddlewareResourceProps,
			b: MiddlewareResourceProps
		) {
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
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = originData.filter(
				(item: MiddlewareResourceProps) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setDataSource(list);
		} else {
			setDataSource(originData);
		}
	};
	return (
		<div>
			<FormBlock title="资源信息" className="resource-pool-info">
				<div className="resource-pool-info-content">
					<div className="resource-pool-gauge-content">
						<div className="resource-pool-gauge-item">
							<ReactEChartsCore
								echarts={echarts}
								option={option1}
								notMerge={true}
								lazyUpdate={true}
								style={{
									height: '100%',
									width: 'calc(100% - 120px)'
								}}
							/>
							<div className="resource-pool-gauge-info">
								总容量：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
								核
								<br />
								已分配：
								{(Number(clusterQuota?.usedCpu) || 0).toFixed(
									2
								)}
								核 <br />
								剩余容量：
								{(
									(Number(clusterQuota?.totalCpu) || 0) -
										Number(clusterQuota?.usedCpu) || 0
								).toFixed(2) || 0}
								核
								<br />
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
									width: 'calc(100% - 120px)'
								}}
							/>
							<div className="resource-pool-gauge-info">
								总容量：
								{(
									Number(clusterQuota?.totalMemory) || 0
								).toFixed(2)}
								核
								<br />
								已分配：
								{(
									Number(clusterQuota?.usedMemory) || 0
								).toFixed(2)}
								核
								<br />
								剩余容量：
								{(
									(Number(clusterQuota?.totalMemory) || 0) -
										Number(clusterQuota?.usedMemory) || 0
								).toFixed(2)}
								核
								<br />
							</div>
						</div>
					</div>
					<div className="resource-pool-table-content">
						<Table
							dataSource={dataSource}
							exact
							primaryKey="key"
							operation={Operation}
							fixedHeader={true}
							maxBodyHeight="225px"
							onSort={onSort}
							onFilter={onFilter}
						>
							<Table.Column
								title="资源分区"
								dataIndex="namespace"
								filters={namespaceFilter}
								filterMode="single"
								width={200}
								lock="left"
							/>
							{viewType === 'service' && (
								<Table.Column
									title="类型"
									dataIndex="type"
									cell={iconTypeRender}
									filters={typeFilter}
									filterMode="single"
									width={200}
								/>
							)}
							{viewType === 'service' && (
								<Table.Column
									title="服务名称/中文别名"
									dataIndex="name"
									cell={nameRender}
									width={180}
								/>
							)}
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
						</Table>
					</div>
				</div>
			</FormBlock>
			<div>
				<Table
					dataSource={nodeDataSource}
					exact
					primaryKey="key"
					operation={NodeOperation}
					onSort={onNodeSort}
					onFilter={onNodeFilter}
				>
					<Table.Column title="节点IP" dataIndex="ip" />
					<Table.Column
						title="CPU(核)"
						dataIndex="cpuRate"
						cell={cpuRender}
						sortable
					/>
					<Table.Column
						title="内存(GB)"
						dataIndex="memoryRate"
						cell={memoryRender}
						sortable
					/>
					<Table.Column
						title="状态"
						dataIndex="status"
						cell={statusRender}
						filterMode="single"
						filters={[
							{ label: '成功', value: 'True' },
							{ label: '失败', value: 'False' }
						]}
					/>
					<Table.Column
						title="创建时间"
						dataIndex="createTime"
						sortable
					/>
				</Table>
			</div>
		</div>
	);
};
export default Overview;
