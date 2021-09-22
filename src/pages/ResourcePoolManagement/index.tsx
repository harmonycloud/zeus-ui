import React, { useState, useEffect } from 'react';
import { Button, Message } from '@alicloud/console-components';
import { useHistory } from 'react-router';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { Page, Header, Content } from '@alicloud/console-components-page';
import moment from 'moment';
import { getClusters } from '@/services/common.js';
import Table from '@/components/MidTable';
import { clusterType } from '@/types';
import messageConfig from '@/components/messageConfig';
import { timeRender, nameRender } from '@/utils/utils';
import DeleteCard from '../BasicResource/DeleteCard';
import RegistryNamespace from '../BasicResource/registryNamespace';
import transBg from '@/assets/images/trans-bg.svg';
import './index.scss';

export default function ResourcePoolManagement() {
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [dataSource, setDataSource] = useState<clusterType[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [namespaceVisible, setNamespaceVisible] = useState<boolean>(false);
	const [data, setData] = useState<clusterType>();
	const history = useHistory();
	useEffect(() => {
		let mounted = true;
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				if (mounted) {
					setClusterList(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	useEffect(() => {
		setDataSource(clusterList);
	}, [clusterList]);
	const getData = () => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
			}
		});
	};
	const Operation = {
		primary: (
			<Button
				onClick={() =>
					history.push('/systemManagement/addResourcePool')
				}
				type="primary"
			>
				添加资源池
			</Button>
		)
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = clusterList.filter(
				(item: clusterType) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setDataSource(list);
		} else {
			setDataSource(clusterList);
		}
	};
	const onSort = (dataIndex: string, order: string) => {
		console.log(dataIndex, order);
		if (dataIndex === 'createTime') {
			const dsTemp = clusterList.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		} else if (dataIndex === 'attributes.nsCount') {
			const dsTemp = clusterList.sort((a, b) => {
				const result = a[dataIndex] - b[dataIndex];
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		} else if (dataIndex === 'cpu') {
			const dsTemp = clusterList.sort((a, b) => {
				const aPer =
					Number(a.storage?.resource?.cpuUsing) /
					Number(a.storage?.resource?.cpuTotal);
				const bPer =
					Number(b.storage?.resource?.cpuUsing) /
					Number(b.storage?.resource?.cpuTotal);
				const result = aPer - bPer;
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		} else if (dataIndex === 'memory') {
			const dsTemp = clusterList.sort((a, b) => {
				const aPer =
					Number(a.storage?.resource?.memoryUsing) /
					Number(a.storage?.resource?.memoryTotal);
				const bPer =
					Number(b.storage?.resource?.memoryUsing) /
					Number(b.storage?.resource?.memoryTotal);
				const result = aPer - bPer;
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		}
	};
	const actionRender = (
		value: string,
		index: number,
		record: clusterType
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push(
							`/systemManagement/addResourcePool/addOther/${record.id}`
						);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton
					onClick={() => {
						setNamespaceVisible(true);
						setData(record);
					}}
				>
					分区
				</LinkButton>
				<LinkButton
					onClick={() => {
						setVisible(true);
						setData(record);
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	const cpuRender = (value: string, index: number, record: clusterType) => {
		const percentage = record.storage?.resource
			? (Number(record.storage?.resource?.cpuUsing) /
					Number(record.storage?.resource?.cpuTotal)) *
			  100
			: 0;
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
					{record.storage?.resource
						? Number(record.storage?.resource?.cpuUsing).toFixed(1)
						: '-'}
					/
					{record.storage?.resource
						? Number(record.storage?.resource?.cpuTotal).toFixed(1)
						: '-'}
				</div>
			</div>
		);
	};
	const memoryRender = (
		value: string,
		index: number,
		record: clusterType
	) => {
		const percentage = record.storage?.resource
			? (Number(record.storage?.resource?.memoryUsing) /
					Number(record.storage?.resource?.memoryTotal)) *
			  100
			: 0;
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
					{record.storage?.resource
						? Number(record.storage?.resource?.memoryUsing).toFixed(
								1
						  )
						: '-'}
					/
					{record.storage?.resource
						? Number(record.storage?.resource?.memoryTotal).toFixed(
								1
						  )
						: '-'}
				</div>
			</div>
		);
	};
	return (
		<Page>
			<Header
				title="系统资源池"
				subTitle="发布中间件需要消耗CPU、内存等资源"
			/>
			<Content>
				<Table
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					// showRefresh
					// onRefresh={getData}
					primaryKey="key"
					operation={Operation}
					onFilter={onFilter}
					onSort={onSort}
				>
					<Table.Column
						title="资源池名称"
						dataIndex="nickname"
						cell={nameRender}
					/>
					<Table.Column
						title="资源分区"
						dataIndex="attributes.nsCount"
						cell={nameRender}
						sortable
					/>
					<Table.Column
						title="CPU(核)"
						dataIndex="cpu"
						cell={cpuRender}
						sortable
					/>
					<Table.Column
						title="内存(GB)"
						dataIndex="memory"
						cell={memoryRender}
						sortable
					/>
					<Table.Column
						title="创建时间"
						dataIndex="attributes.createTime"
						cell={timeRender}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
					/>
				</Table>
			</Content>
			{visible && data && (
				<DeleteCard
					id={data.id}
					visible={visible}
					onCancel={() => setVisible(false)}
					updateFn={getData}
				/>
			)}
			{namespaceVisible && data && (
				<RegistryNamespace
					visible={namespaceVisible}
					clusterId={data.id}
					cancelHandle={() => setNamespaceVisible(false)}
					updateFn={getData}
				/>
			)}
		</Page>
	);
}
