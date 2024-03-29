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
import LineLoading from '@/components/LineLoading';
import MemoryItem from './memoryItem';

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
	const [cpuAndMemoryList, setCpuAndMemoryList] = useState<clusterType[]>([]);
	const [key, setKey] = useState<string>('');
	const [isAccess, setIsAccess] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [isRefresh, setIsRefresh] = useState<boolean>(false);
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
		setLoading(true);
		getClusters({ detail: true, key })
			.then((res) => {
				if (res.success) {
					if (mounted) {
						setClusterList(res.data);
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);
	const getData = (key: string) => {
		setLoading(true);
		getClusters({ detail: true, key })
			.then((res) => {
				if (res.success) {
					setClusterList(res.data);
					setIsRefresh(!isRefresh);
				}
			})
			.finally(() => {
				setLoading(false);
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
		return (
			<MemoryItem
				clusterId={record.id}
				type="cpu"
				isRefresh={isRefresh}
			/>
		);
	};
	const memoryRender = (
		value: string,
		record: clusterType,
		index: number
	) => {
		return (
			<MemoryItem
				clusterId={record.id}
				type="memory"
				isRefresh={isRefresh}
			/>
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
					storage.setSession(
						'cluster-detail-current-tab',
						'namespace'
					);
				}}
			>
				{record.attributes.nsCount}
			</span>
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
					dataSource={clusterList}
					showRefresh
					onRefresh={() => getData(key)}
					search={{
						onSearch: handleSearch,
						placeholder: '请输入集群名称搜索'
					}}
					rowKey="name"
					operation={Operation}
					loading={loading}
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
								(a.clusterQuotaDTO?.usedCpu || 0) /
									(a.clusterQuotaDTO?.totalCpu || 0) || 0;
							const bPer =
								(b.clusterQuotaDTO?.usedCpu || 0) /
									(b.clusterQuotaDTO?.totalCpu || 0) || 0;
							return aPer - bPer;
						}}
					/>
					<ProTable.Column
						title="内存(GB)"
						dataIndex="memory"
						render={memoryRender}
						sorter={(a, b) => {
							const aPer =
								(a.clusterQuotaDTO?.usedMemory || 0) /
									(a.clusterQuotaDTO?.totalMemory || 0) || 0;
							const bPer =
								(b.clusterQuotaDTO?.usedMemory || 0) /
									(b.clusterQuotaDTO?.totalMemory || 0) || 0;
							return aPer - bPer;
						}}
					/>
					<ProTable.Column
						title="创建时间"
						dataIndex="createTime"
						render={createTimeRender}
						sorter={(a, b) => {
							if (!b.attributes.createTime) return -1;
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
