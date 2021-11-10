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
	const [dataSource, setDataSource] = useState<MiddlewareResourceProps[]>([]);
	const [nodeDataSource, setNodeDataSource] = useState<NodeResourceProps[]>(
		[]
	);
	const [clusterQuota, setClusterQuota] = useState<ClusterQuotaDTO>();
	const [option1, setOption1] = useState(getGaugeOption(0, 'CPU(核)'));
	const [option2, setOption2] = useState(getGaugeOption(0, '内存(GB)'));

	const params: paramsProps = useParams();
	const { id } = params;
	useEffect(() => {
		let mounted = true;
		getMiddlewareResource({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		getNodeResource({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
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
				setDataSource(res.data);
			} else {
				setDataSource([]);
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const getNode = () => {
		getNodeResource({ clusterId: id }).then((res) => {
			if (res.success) {
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
			<div>
				<div className="name-link">{record.name}</div>
				<div>{record.aliasName}</div>
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
	const onSort = (dataIndex: string, order: string) => {
		const temp = dataSource.sort(function (
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

	return (
		<div>
			<FormBlock title="资源信息">
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
								总容量：{clusterQuota?.totalCpu.toFixed(2)}核
								<br />
								已分配：{clusterQuota?.usedCpu.toFixed(
									2
								)}核 <br />
								剩余容量：
								{Number(clusterQuota?.totalCpu.toFixed(2)) -
									Number(clusterQuota?.usedCpu.toFixed(2)) ||
									0}
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
								总容量：{clusterQuota?.totalMemory.toFixed(2)}核
								<br />
								已分配：{clusterQuota?.usedMemory.toFixed(
									2
								)}核 <br />
								剩余容量：
								{Number(clusterQuota?.totalMemory.toFixed(2)) -
									Number(
										clusterQuota?.usedMemory.toFixed(2)
									) || 0}
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
							maxBodyHeight="250px"
							onSort={onSort}
						>
							<Table.Column
								title="资源分区"
								dataIndex="namespace"
							/>
							{viewType === 'service' && (
								<Table.Column
									title="类型"
									dataIndex="type"
									cell={iconTypeRender}
								/>
							)}
							{viewType === 'service' && (
								<Table.Column
									title="服务名称/中文别名"
									dataIndex="name"
									cell={nameRender}
								/>
							)}
							{tableType === 'cpu' && (
								<Table.Column
									title="CPU配额（核）"
									dataIndex="requestCpu"
									cell={nullRender}
								/>
							)}
							{tableType === 'cpu' && (
								<Table.Column
									title="近5min平均使用额（核）"
									dataIndex="per5MinCpu"
									cell={nullRender}
								/>
							)}
							{tableType === 'cpu' && (
								<Table.Column
									title="CPU使用率（%）"
									dataIndex="cpuRate"
									cell={nullRender}
								/>
							)}
							{tableType === 'memory' && (
								<Table.Column
									title="内存配额（GB）"
									dataIndex="requestMemory"
									cell={nullRender}
								/>
							)}
							{tableType === 'memory' && (
								<Table.Column
									title="近5min平均使用额（GB）"
									dataIndex="per5MinMemory"
									cell={nullRender}
								/>
							)}
							{tableType === 'memory' && (
								<Table.Column
									title="内存使用率（%）"
									dataIndex="memoryRate"
									cell={nullRender}
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
