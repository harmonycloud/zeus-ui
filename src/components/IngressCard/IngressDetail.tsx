import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { Modal, Table, Tabs, notification, Button } from 'antd';
import DataFields from '../DataFields';
import { ProContent, ProHeader, ProPage } from '../ProPage';
import {
	getIngressDetail,
	getPods,
	getPorts,
	restartPod
} from '@/services/ingress';
import { iconRender } from '../MidCard';
import { iconTypeRender, objectRemoveDuplicatesByKey } from '@/utils/utils';
import { FiltersProps } from '@/types/comment';
import Actions from '../Actions';
import CheckYaml from './checkYaml';
import storage from '@/utils/storage';
import transTime from '@/utils/transTime';

const { TabPane } = Tabs;
const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
interface paramsProps {
	clusterId: string;
	ingressClassName: string;
	type: string;
}
const nginxInfoConfig = [
	{
		dataIndex: 'title',
		render: (val: string) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'status',
		label: '当前状态',
		render: (val: string) => (
			<div className="mid-card-icon">{iconRender(Number(val))}</div>
		)
	},
	{
		dataIndex: 'address',
		label: 'VIP配置',
		render: (val: string) => val || '/'
	},
	{
		dataIndex: 'nodeAffinity',
		label: '节点亲和',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'tolerations',
		label: '污点容忍',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val || '/'}
			</div>
		)
	},
	{
		dataIndex: 'httpPort',
		label: 'http端口'
	},
	{
		dataIndex: 'httpsPort',
		label: 'https端口'
	},
	{
		dataIndex: 'healthzPort',
		label: 'healthz端口'
	},
	{
		dataIndex: 'defaultServerPort',
		label: '默认服务端口'
	}
];
const traefikInfoConfig = [
	{
		dataIndex: 'title',
		render: (val: string) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'status',
		label: '当前状态',
		render: (val: string) => (
			<div className="mid-card-icon">{iconRender(Number(val))}</div>
		)
	},
	{
		dataIndex: 'address',
		label: 'VIP配置',
		render: (val: string) => val || '/'
	},
	{
		dataIndex: 'nodeAffinity',
		label: '节点亲和',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'tolerations',
		label: '污点容忍',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val || '/'}
			</div>
		)
	},
	{
		dataIndex: 'portOrg',
		label: '服务端口组'
	},
	{
		dataIndex: 'httpPort',
		label: 'http端口'
	},
	{
		dataIndex: 'httpsPort',
		label: 'https端口'
	},
	{
		dataIndex: 'dashboardPort',
		label: 'Dashboard端口'
	},
	{
		dataIndex: 'monitorPort',
		label: '数据监控端口'
	}
];
export default function IngressDetail(): JSX.Element {
	const params: paramsProps = useParams();
	const history = useHistory();
	const [basicInfo, setBasicInfo] = useState({});
	const [portDataSource, setPortDataSource] = useState([]);
	const [filters, setFilters] = useState<FiltersProps[]>([]);
	const [podDataSource, setPodDataSource] = useState([]);
	const [statusFilters, setStatusFilters] = useState<FiltersProps[]>([]);
	const [podYamlVisible, setPodYamlVisible] = useState<boolean>(false);
	const [podRecord, setPodRecord] = useState({});
	useEffect(() => {
		getIngressDetail({
			clusterId: params.clusterId,
			ingressClassName: params.ingressClassName
		}).then((res) => {
			if (res.success) {
				setBasicInfo({
					title: '基本信息',
					status: res.data.status,
					address: res.data.address,
					nodeAffinity: `${
						(res.data.nodeAffinity &&
							res.data.nodeAffinity
								.map((item: any) => item.label)
								.join(';')) ||
						'无'
					}(${
						res.data.nodeAffinity &&
						res.data.nodeAffinity[0].required
							? '强制'
							: '非强制'
					})`,
					tolerations: res.data.tolerations?.join(','),
					httpPort: res.data.httpPort || '/',
					httpsPort: res.data.httpsPort || '/',
					healthzPort: res.data.healthzPort || '/',
					defaultServerPort: res.data.defaultServerPort || '/',
					portOrg: res.data.startPort
						? `${res.data.startPort}-${res.data.endPort}(100个)`
						: '/',
					dashboardPort: res.data.dashboardPort || '/',
					monitorPort: res.data.monitorPort || '/'
				});
			}
		});
		getPorts({
			clusterId: params.clusterId,
			ingressClassName: params.ingressClassName
		}).then((res) => {
			if (res.success) {
				setPortDataSource(res.data);
				setFilters(
					objectRemoveDuplicatesByKey(
						res.data.map((item: any) => {
							return {
								value: item.middlewareOfficialName,
								text: item.middlewareOfficialName
							};
						}),
						'value'
					)
				);
			}
		});
		getPodData();
	}, []);
	const getPodData = () => {
		getPods({
			clusterId: params.clusterId,
			ingressName: params.ingressClassName
		}).then((res) => {
			if (res.success) {
				setPodDataSource(res.data);
				setStatusFilters(
					objectRemoveDuplicatesByKey(
						res.data.map((item: any) => {
							return {
								value: item.status,
								text: item.status
							};
						}),
						'value'
					)
				);
			}
		});
	};
	const portRedner = (value: string, record: any) => {
		return record.serviceList?.[0].exposePort;
	};
	const mappingRender = (value: string, record: any) => {
		return record.serviceList?.[0].servicePort;
	};
	const onRestart = (record: any) => {
		confirm({
			title: '操作确认',
			content:
				'根据重启的节点角色不同，重启操作可能会导致服务中断，请谨慎操作',
			onOk: () => {
				restartPod({
					clusterId: params.clusterId,
					ingressClassName: params.ingressClassName,
					podName: record.podName
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '重启中，3秒后刷新数据'
						});
						getPodData();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	const actionRender = (value: string, record: any) => {
		return (
			<Actions>
				<LinkButton onClick={() => onRestart(record)}>重启</LinkButton>
				<LinkButton
					onClick={() => {
						setPodRecord(record);
						setPodYamlVisible(true);
					}}
				>
					查看yaml
				</LinkButton>
			</Actions>
		);
	};
	const createTimeRender = (value: string) => {
		return transTime.gmt2local(value);
	};
	return (
		<ProPage>
			<ProHeader
				onBack={() => {
					storage.setSession('cluster-detail-current-tab', 'ingress');
					window.history.back();
				}}
				title={params.ingressClassName}
				extra={[
					<Button
						key="1"
						type="primary"
						onClick={() => {
							history.push(
								`/systemManagement/systemAlarm/ingress/${params.clusterId}/${params.ingressClassName}`
							);
						}}
					>
						编辑yaml
					</Button>
				]}
			/>
			<ProContent>
				<DataFields
					dataSource={basicInfo}
					items={
						params.type === 'nginx'
							? nginxInfoConfig
							: traefikInfoConfig
					}
				/>
				<Tabs>
					<TabPane tab="端口列表" key="1">
						<Table
							dataSource={portDataSource}
							rowKey={(record: any) =>
								record.serviceList?.[0].exposePort
							}
						>
							<Table.Column
								dataIndex="port"
								title="端口号"
								render={portRedner}
							/>
							<Table.Column
								dataIndex="middlewareName"
								title="所属服务"
								filters={filters}
								filterMultiple={false}
								onFilter={(value, record) =>
									record.middlewareOfficialName === value
								}
								render={iconTypeRender}
							/>
							<Table.Column
								dataIndex="mappingPort"
								title="映射端口"
								render={mappingRender}
							/>
							<Table.Column
								dataIndex="servicePurpose"
								title="映射服务"
							/>
						</Table>
					</TabPane>
					<TabPane tab="Pod列表" key="2">
						<Table dataSource={podDataSource} key="podName">
							<Table.Column dataIndex="podName" title="Pod名称" />
							<Table.Column
								dataIndex="status"
								title="运行状态"
								filters={statusFilters}
								filterMultiple={false}
								onFilter={(value, record: any) =>
									record.status === value
								}
							/>
							<Table.Column
								dataIndex="restartCount"
								title="重启次数"
							/>
							<Table.Column dataIndex="podIp" title="Pod IP" />
							<Table.Column dataIndex="hostIp" title="主机地址" />
							<Table.Column
								dataIndex="createTime"
								title="创建时间"
								render={createTimeRender}
							/>
							<Table.Column
								dataIndex="action"
								title="操作"
								render={actionRender}
							/>
						</Table>
					</TabPane>
				</Tabs>
			</ProContent>
			{podRecord && podYamlVisible && (
				<CheckYaml
					visible={podYamlVisible}
					onCancel={() => setPodYamlVisible(false)}
					clusterId={params.clusterId}
					ingressName={params.ingressClassName}
					data={podRecord}
				/>
			)}
		</ProPage>
	);
}
