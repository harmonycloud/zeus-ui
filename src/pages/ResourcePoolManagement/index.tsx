import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Button, Modal, notification } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import {
	deleteCluster,
	getClusters,
	getClusterCpuAndMemory
} from '@/services/common';
import { clusterType } from '@/types';
import transBg from '@/assets/images/trans-bg.svg';
import storage from '@/utils/storage';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { getIsAccessGYT } from '@/services/common';
import './index.scss';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
interface ResourcePoolManagementProps {
	setRefreshCluster: (flag: boolean) => void;
}
function ResourcePoolManagement(
	props: ResourcePoolManagementProps
): JSX.Element {
	const { setRefreshCluster } = props;
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [dataSource, setDataSource] = useState<clusterType[]>([]);
	const [key, setKey] = useState<string>('');
	const [isAccess, setIsAccess] = useState<boolean>(false);
	const history = useHistory();
	useEffect(() => {
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	useEffect(() => {
		let mounted = true;
		getClusters({ detail: true, key }).then((res) => {
			if (res.success) {
				if (mounted) {
					const list = res.data.map((item: clusterType) => {
						getClusterCpuAndMemory({ clusterId: item.id }).then(
							(r) => {
								item.clusterQuotaDTO = r.data;
							}
						);
						return item;
					});
					setClusterList(res.data);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	useEffect(() => {
		setDataSource(clusterList);
	}, [clusterList]);
	const getData = (key: string) => {
		getClusters({ detail: true, key }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
			}
		});
	};
	const handleChange = (value: string) => {
		setKey(value);
	};
	const handleSearch = (value: string) => {
		getData(value);
	};
	const Operation = {
		primary: (
			<Button
				onClick={() =>
					history.push(
						'/systemManagement/resourcePoolManagement/addResourcePool'
					)
				}
				disabled={isAccess}
				title={isAccess ? '平台已接入观云台，请联系观云台管理员' : ''}
				type="primary"
			>
				添加集群
			</Button>
		)
	};
	const actionRender = (
		value: string,
		record: clusterType,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push(
							`/systemManagement/resourcePoolManagement/editResourcePool/editOther/${record.id}`
						);
					}}
					disabled={isAccess}
					title={
						isAccess ? '平台已接入观云台，请联系观云台管理员' : ''
					}
				>
					编辑
				</LinkButton>
				<LinkButton
					disabled={isAccess}
					title={
						isAccess ? '平台已接入观云台，请联系观云台管理员' : ''
					}
					onClick={() => {
						if (record.removable) {
							confirm({
								title: '操作提醒',
								content:
									'该集群所有的数据都将被清空，无法找回，是否继续?',
								onOk() {
									return deleteCluster({
										clusterId: record.id
									}).then((res) => {
										if (res.success) {
											notification.success({
												message: '成功',
												description: '删除成功'
											});
											setRefreshCluster(true);
											getData(key);
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
							Modal.info({
								title: '提示',
								okText: '我知道了',
								content:
									'该集群正在被中间件服务使用，请删除后再试'
							});
						}
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	const cpuRender = (value: string, record: clusterType, index: number) => {
		const percentage = record.clusterQuotaDTO
			? (Number(record.clusterQuotaDTO?.usedCpu) /
					Number(record.clusterQuotaDTO?.totalCpu)) *
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
					{record.clusterQuotaDTO
						? Number(record.clusterQuotaDTO?.usedCpu).toFixed(1)
						: '-'}
					/
					{record.clusterQuotaDTO
						? Number(record.clusterQuotaDTO?.totalCpu).toFixed(1)
						: '-'}
				</div>
			</div>
		);
	};
	const clusterNameRender = (value: string, record: any, index: number) => {
		return (
			<span
				className="name-link"
				onClick={() =>
					history.push(
						`/systemManagement/resourcePoolManagement/resourcePoolDetail/${record.id}/${record.nickname}`
					)
				}
			>
				{value}
			</span>
		);
	};
	const nameRender = (value: string, record: any, index: number) => {
		return (
			<span
				className="name-link"
				onClick={() => {
					history.push(
						`/systemManagement/resourcePoolManagement/resourcePoolDetail/${record.id}/${record.nickname}`
					);
					storage.setLocal('cluster-detail-current-tab', 'namespace');
				}}
			>
				{record.attributes.nsCount}
			</span>
		);
	};
	const memoryRender = (
		value: string,
		record: clusterType,
		index: number
	) => {
		const percentage = record.clusterQuotaDTO
			? (Number(record.clusterQuotaDTO?.usedMemory) /
					Number(record.clusterQuotaDTO?.totalMemory)) *
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
					{record.clusterQuotaDTO
						? Number(record.clusterQuotaDTO?.usedMemory).toFixed(1)
						: '-'}
					/
					{record.clusterQuotaDTO
						? Number(record.clusterQuotaDTO?.totalMemory).toFixed(1)
						: '-'}
				</div>
			</div>
		);
	};
	const createTimeRender = (
		value: string,
		record: clusterType,
		index: number
	) => {
		return record.attributes.createTime || '/';
	};
	return (
		<ProPage>
			<ProHeader
				title="集群管理"
				subTitle="发布中间件需要消耗CPU、内存等资源"
			/>
			<ProContent>
				<ProTable
					dataSource={dataSource}
					showRefresh
					onRefresh={() => getData(key)}
					search={{
						onSearch: handleSearch,
						placeholder: '请输入集群名称搜索'
					}}
					rowKey="name"
					operation={Operation}
				>
					<ProTable.Column
						title="集群名称"
						dataIndex="nickname"
						render={clusterNameRender}
					/>
					<ProTable.Column
						title="命名空间"
						dataIndex="nsCount"
						render={nameRender}
						sorter={(a, b) =>
							a.attributes.nsCount - b.attributes.nsCount
						}
					/>
					<ProTable.Column
						title="CPU(核)"
						dataIndex="cpu"
						render={cpuRender}
						sorter={(a, b) => {
							const aPer =
								Number(a.clusterQuotaDTO?.usedCpu) /
								Number(a.clusterQuotaDTO?.totalCpu);
							const bPer =
								Number(b.clusterQuotaDTO?.usedCpu) /
								Number(b.clusterQuotaDTO?.totalCpu);
							return aPer - bPer;
						}}
					/>
					<ProTable.Column
						title="内存(GB)"
						dataIndex="memory"
						render={memoryRender}
						sorter={(a, b) => {
							const aPer =
								Number(a.clusterQuotaDTO?.usedMemory) /
								Number(a.clusterQuotaDTO?.totalMemory);
							const bPer =
								Number(b.clusterQuotaDTO?.usedMemory) /
								Number(b.clusterQuotaDTO?.totalMemory);
							return aPer - bPer;
						}}
					/>
					<ProTable.Column
						title="创建时间"
						dataIndex="createTime"
						render={createTimeRender}
						sorter={(a, b) => {
							return (
								moment(a.attributes.createTime).unix() -
								moment(b.attributes.createTime).unix()
							);
						}}
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
export default connect(() => ({}), {
	setRefreshCluster
})(ResourcePoolManagement);
