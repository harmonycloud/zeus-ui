import React, { useEffect, useState } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { useParams, useHistory } from 'react-router';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import MidProcess from '@/components/MidProcess';
import {
	getZonesResource,
	getZoneNodes,
	deleteNode
} from '@/services/activeActive';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import {
	GridComponent,
	TooltipComponent,
	TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { getGaugeOption, getPieOption } from '@/utils/echartsOption';
import { UsableNodeItem, ZonesItem } from './activeActive';
import { Button, Modal, notification } from 'antd';
import storage from '@/utils/storage';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
// Register the required components
echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	GaugeChart,
	CanvasRenderer
]);
interface AreaDetailParams {
	id: string;
	areaName: string;
	aliasName: string;
	nickname: string;
}
export default function AreaDetail(): JSX.Element {
	const params: AreaDetailParams = useParams();
	const history = useHistory();
	const [data, setData] = useState<ZonesItem>();
	const [option1, setOption1] = useState(getGaugeOption(0, 'CPU(核)'));
	const [option2, setOption2] = useState(getGaugeOption(0, '内存(GB)'));
	const [option3, setOption3] = useState(getPieOption(null, true));
	const [dataSource, setDataSource] = useState<UsableNodeItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<UsableNodeItem[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getZonesResource({
			clusterId: params.id,
			areaName: params.areaName
		}).then((res) => {
			if (res.success) {
				setData(res.data);
				const option1Temp = getGaugeOption(
					res.data.cpuRate / 100,
					'CPU(核)'
				);
				const option2Temp = getGaugeOption(
					res.data.memoryRate / 100,
					'内存(GB)'
				);
				const option3Temp = getPieOption(
					{
						error: res.data.errServiceNum || 0,
						running: res.data.runningNodeCount || 0,
						total:
							(res.data.errServiceNum || 0) +
							(res.data.runningNodeCount || 0)
					},
					true
				);
				setOption1(option1Temp);
				setOption2(option2Temp);
				setOption3(option3Temp);
			}
		});
		getZoneNodes({ clusterId: params.id, areaName: params.areaName }).then(
			(res) => {
				if (res.success) {
					setDataSource(res.data);
					setShowDataSource(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			}
		);
	};
	const Operation = {
		primary: (
			<Button
				onClick={() =>
					history.push(
						`/activeActive/active-active/${params.id}/${params.aliasName}/${params.areaName}/${params.aliasName}`
					)
				}
				type="primary"
			>
				新增
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		const list = dataSource.filter((item) => item.ip.includes(value));
		setShowDataSource(list);
	};
	const cpuRender = (
		value: string,
		record: UsableNodeItem,
		index: number
	) => {
		return (
			<MidProcess
				total={record.cpuTotal}
				per={record.cpuRate}
				used={record.cpuUsed}
			/>
		);
	};
	const memoryRender = (
		value: string,
		record: UsableNodeItem,
		index: number
	) => {
		return (
			<MidProcess
				total={record.memoryTotal}
				per={record.memoryRate}
				used={record.memoryUsed}
				color="#F8A359"
				right="rgb(248, 163, 89)"
				bottom="rgb(252, 201, 116)"
			/>
		);
	};
	const statusRender = (
		value: string,
		record: UsableNodeItem,
		index: number
	) => {
		if (record.status === 'True') {
			return <div className="zeus-success-circle">正常</div>;
		} else {
			return <div className="zeus-error-circle">异常</div>;
		}
	};
	const actionRender = (
		value: string,
		record: UsableNodeItem,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						confirm({
							title: '操作确认',
							content: '是否确认删除该节点？',
							onOk: () => {
								return deleteNode({
									clusterId: params.id,
									nodeName: record.nodeName,
									areaName: params.areaName
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '节点删除成功'
										});
										getData();
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
								});
							}
						});
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<ProPage>
			<ProHeader
				title={params.aliasName}
				onBack={() => {
					history.goBack();
				}}
			/>
			<ProContent>
				<div className="zeus-active-detail-resource-content">
					<div className="zeus-active-detail-pie-content">
						<ReactEChartsCore
							echarts={echarts}
							option={option3}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: '100%'
								// width: 'calc(100% - 360px)'
							}}
						/>
					</div>
					<div className="zeus-active-detail-dashboard-content">
						<ReactEChartsCore
							echarts={echarts}
							option={option1}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: '100%'
								// width: 'calc(100% - 360px)'
							}}
						/>
						<div className="zeus-active-detail-dashboard-info">
							总容量：{data?.cpuTotal} 核 <br />
							已使用：{data?.cpuUsed} 核 <br />
							剩余容量：{' '}
							{(
								(data?.cpuTotal || 0) - (data?.cpuUsed || 0)
							).toFixed(2)}{' '}
							核
							<br />
						</div>
					</div>
					<div className="zeus-active-detail-dashboard-content">
						<ReactEChartsCore
							echarts={echarts}
							option={option2}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: '100%'
								// width: 'calc(100% - 360px)'
							}}
						/>
						<div className="zeus-active-detail-dashboard-info">
							总容量：{data?.memoryTotal || 0} GB <br />
							已使用：{data?.memoryUsed || 0} GB <br />
							剩余容量：{' '}
							{(
								(data?.memoryTotal || 0) -
								(data?.memoryUsed || 0)
							).toFixed(2)}{' '}
							GB
							<br />
						</div>
					</div>
				</div>
				<ProTable
					dataSource={showDataSource}
					search={{
						onSearch: handleSearch,
						placeholder: '请输入关键字搜索'
					}}
					rowKey="ip"
					operation={Operation}
				>
					<ProTable.Column title="节点名称" dataIndex="ip" />
					<ProTable.Column
						title="CPU(核)"
						dataIndex="cpuRate"
						render={cpuRender}
						sorter={(a: UsableNodeItem, b: UsableNodeItem) =>
							Number(a.cpuRate) - Number(b.cpuRate)
						}
					/>
					<ProTable.Column
						title="内存(GB)"
						dataIndex="memoryRate"
						render={memoryRender}
						sorter={(a: UsableNodeItem, b: UsableNodeItem) =>
							Number(a.memoryRate) - Number(b.memoryRate)
						}
					/>
					<ProTable.Column
						title="状态"
						dataIndex="status"
						render={statusRender}
						filters={[
							{ text: '正常', value: 'True' },
							{ text: '异常', value: 'False' }
						]}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						render={actionRender}
					/>
				</ProTable>
			</ProContent>
		</ProPage>
	);
}
