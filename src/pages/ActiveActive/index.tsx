import React, { useEffect, useState } from 'react';
import { Collapse, notification, Modal, Input, Alert } from 'antd';
import { useHistory } from 'react-router';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import { CloseOutlined } from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';
import ActiveCard from './ActiveCard';
import { getActiveClusters, startActive } from '@/services/activeActive';
import { ActiveClusterItem } from './activeActive';
import './index.scss';
import DefaultPicture from '@/components/DefaultPicture';

const { confirm } = Modal;
const { Panel } = Collapse;
export default function ActiveActive(): JSX.Element {
	const history = useHistory();
	const [panelVisible, setPanelVisible] = useState<boolean>(true);
	const [panel1Visible, setPanel1Visible] = useState<boolean>(true);
	const [activeClusters, setActiveClusters] = useState<ActiveClusterItem[]>(
		[]
	);
	const [originData, setOriginData] = useState<ActiveClusterItem[]>([]);
	useEffect(() => {
		let mounted = true;
		if (mounted) {
			getActiveClusters().then((res) => {
				if (res.success) {
					setOriginData(res.data);
					setActiveClusters(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
		return () => {
			mounted = false;
		};
	}, []);
	const genExtra = (record: number) => (
		<CloseOutlined
			onClick={(event) => {
				record === 0 ? setPanelVisible(false) : setPanel1Visible(false);
				// If you don't want click extra trigger collapse, you can prevent this:
				event.stopPropagation();
			}}
		/>
	);
	const toActiveDetail = (record: ActiveClusterItem) => {
		if (!record.activeActive) {
			confirm({
				title: '操作确认',
				content: (
					<>
						当前集群尚未开启可用区配置，是否开启可用区？
						<br />
						<span style={{ color: '#ff4d4f' }}>
							注：开启后无法关闭可用区配置！
						</span>
					</>
				),
				onOk: () => {
					startActive({ clusterId: record.clusterId }).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '可用区开启成功！'
							});
							setTimeout(() => {
								history.push(
									`/activeActive/${record.clusterId}/${record.clusterAliasName}`
								);
							}, 1000);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				}
			});
		} else {
			history.push(
				`/activeActive/${record.clusterId}/${record.clusterAliasName}`
			);
		}
	};
	const onSearch = (value: string) => {
		console.log(value);
		const list = originData.filter((item) =>
			item.clusterAliasName.includes(value)
		);
		setActiveClusters(list);
	};
	return (
		<ProPage>
			<ProHeader
				avatar={{
					icon: (
						<IconFont
							type="icon-tongchengshuanghuo"
							style={{ fontSize: 28 }}
						/>
					),
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
				}}
				title="同城双活"
				subTitle="针对不同集群内的可用区进行管理"
			/>
			<ProContent className="active-active-box">
				<Alert
					message={
						'当kubernetes集群版本低于1.7时无法使用双活功能，请升级kubernetes集群版本'
					}
					type="warning"
					showIcon
					closable
					style={{ marginBottom: 16 }}
				/>
				{(panel1Visible || panelVisible) && (
					<Collapse className="site-collapse-custom-collapse">
						{panelVisible && (
							<Panel
								className="site-collapse-custom-panel"
								key="0"
								header="什么是同城双活？"
								extra={genExtra(0)}
							>
								同城双活是基于云原生能力，在应用层面和数据层面实现跨数据中心的部署方案，在不对业务进行改造的前提下，保持数据读写一致性，并且保证中间件同城双活故障秒级跨数据中心切换，实现高可用。
							</Panel>
						)}
						{panel1Visible && (
							<Panel
								className="site-collapse-custom-panel"
								key="1"
								header="什么是可用区？"
								extra={genExtra(1)}
							>
								可用区是指在同城双活场景下，数据中心概念的载体，通过可用区来划分数据中心，实现跨数据中心部署及故障秒级切换。
							</Panel>
						)}
					</Collapse>
				)}
				<Input.Search
					style={{ width: 250, marginBottom: 16 }}
					placeholder="请输入关键词搜索"
					onSearch={onSearch}
				/>
				<div className="active-list-content">
					{activeClusters.map((item: ActiveClusterItem) => {
						return (
							<ActiveCard
								key={item.clusterId}
								title={item.clusterAliasName || item.clusterId}
								isActive={item.activeActive || false}
								areaNumber={item.activeAreaNum}
								status={item.statusCode}
								onClick={() => toActiveDetail(item)}
							/>
						);
					})}
					{activeClusters.length === 0 && (
						<DefaultPicture title="当前列表无数据" />
					)}
				</div>
			</ProContent>
		</ProPage>
	);
}
