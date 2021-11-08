import React, { useEffect, useState } from 'react';
import { Radio, Balloon, Message, Icon } from '@alicloud/console-components';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import FormBlock from '@/pages/ServiceCatalog/components/FormBlock';
import CustomIcon from '@/components/CustomIcon';
import { iconTypeRender } from '@/utils/utils';
import { paramsProps } from '../detail';
import { getMiddlewareResource, getNodeResource } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import transBg from '@/assets/images/trans-bg.svg';
import { NodeResourceProps, MiddlewareResourceProps } from '../resource.pool';

const RadioGroup = Radio.Group;
const Tooltip = Balloon.Tooltip;
const Overview = () => {
	const [viewType, setViewType] = useState<string>('service');
	const [tableType, setTableType] = useState<string>('cpu');
	const [dataSource, setDataSource] = useState<MiddlewareResourceProps[]>([]);
	const [nodeDataSource, setNodeDataSource] = useState<NodeResourceProps[]>(
		[]
	);
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
		return () => {
			mounted = false;
		};
	}, []);
	const getMiddlewares = () => {
		getMiddlewareResource({ clusterId: id }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
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
	const onViewChange = (value: string | number | boolean, type: string) => {
		switch (type) {
			case 'view':
				setViewType(value as string);
				break;
			case 'table':
				setTableType(value as string);
				break;
			default:
				break;
		}
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
	return (
		<div>
			<FormBlock title="资源信息">
				<div className="resource-pool-info-content">
					<div className="resource-pool-gauge-content"></div>
					<div className="resource-pool-table-content">
						<Table
							dataSource={dataSource}
							exact
							primaryKey="key"
							operation={Operation}
						>
							<Table.Column title="资源分区" dataIndex="id" />
							{viewType === 'service' && (
								<Table.Column
									title="类型"
									dataIndex="id"
									cell={iconTypeRender}
								/>
							)}
							{viewType === 'service' && (
								<Table.Column
									title="服务名称/中文别名"
									dataIndex="id"
								/>
							)}
							{tableType === 'cpu' && (
								<Table.Column
									title="CPU配额（核）"
									dataIndex="id"
								/>
							)}
							{tableType === 'cpu' && (
								<Table.Column
									title="近5min平均使用额（核）"
									dataIndex="id"
								/>
							)}
							{tableType === 'cpu' && (
								<Table.Column
									title="CPU使用率（%）"
									dataIndex="id"
								/>
							)}
							{tableType === 'memory' && (
								<Table.Column
									title="内存配额（GB）"
									dataIndex="id"
								/>
							)}
							{tableType === 'memory' && (
								<Table.Column
									title="近5min平均使用额（GB）"
									dataIndex="id"
								/>
							)}
							{tableType === 'memory' && (
								<Table.Column
									title="内存使用率（%）"
									dataIndex="id"
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
