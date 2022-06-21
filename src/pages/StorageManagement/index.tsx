import React, { useEffect, useState } from 'react';
import { Space, Button, Select, notification, Modal } from 'antd';
import { useHistory } from 'react-router';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import { ListCard, ListCardItem } from '@/components/ListCard';
import Actions from '@/components/Actions';
import ProList from '@/components/ProList';
import storageIcon from '@/assets/images/storage-manage.svg';
import { getLists, getTypes, deleteStorage } from '@/services/storage';
import { getClusters } from '@/services/common';
import { clusterType } from '@/types';
import { GetParams, StorageItem, GetDetailParams } from './storageManage';

const LinkButton = Actions.LinkButton;
const { Option } = Select;
const { confirm } = Modal;
export default function StorageManagement(): JSX.Element {
	const history = useHistory();
	const [storages, setStorages] = useState<StorageItem[]>([]);
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [typeList, setTypeList] = useState<string[]>([]);
	const [selectedClusterId, setSelectedClusterId] = useState<string>('*');
	const [selectedType, setSelectedType] = useState<string>('');
	const [key, setKey] = useState<string>('');
	useEffect(() => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		getTypes({ clusterId: '*' }).then((res) => {
			if (res.success) {
				setTypeList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		getData(key);
	}, [selectedClusterId, selectedType]);
	const getData = (keyword: string) => {
		const sendData: GetParams = {
			all: false,
			clusterId: selectedClusterId || '*',
			type: selectedType || '',
			key: keyword || ''
		};
		getLists(sendData).then((res) => {
			if (res.success) {
				setStorages(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const handleSearch = (e: any) => {
		getData(e.target.value);
	};
	const handleChange = (value: string, type: string) => {
		if (type === 'cluster') {
			setSelectedClusterId(value);
		} else {
			setSelectedType(value);
		}
	};
	const Operation = {
		primary: (
			<Space>
				<Button
					type="primary"
					onClick={() => {
						history.push('/storageManagement/create');
					}}
				>
					新增
				</Button>
				<label>集群:</label>
				<Select
					defaultValue="*"
					style={{ width: 120 }}
					onChange={(value: string) => handleChange(value, 'cluster')}
				>
					<Option value="*">全部</Option>
					{clusterList.map((item: clusterType) => {
						return (
							<Option value={item.id} key={item.id}>
								{item.nickname}
							</Option>
						);
					})}
				</Select>
				<label>类型:</label>
				<Select
					defaultValue=""
					style={{ width: 120 }}
					onChange={(value: string) => handleChange(value, 'type')}
				>
					<Option value="">全部</Option>
					{typeList.map((item: string) => {
						return (
							<Option key={item} value={item}>
								{item}
							</Option>
						);
					})}
				</Select>
			</Space>
		)
	};
	const quotaRender = (record: StorageItem) => {
		return `${Number(record.monitorResourceQuota.storage.used)}GB`;
	};
	return (
		<ProPage>
			<ProHeader
				avatar={{
					children: <img src={storageIcon} />,
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
				}}
				title="存储管理"
				subTitle="发布中间件需要使用的存储"
			/>
			<ProContent>
				<ProList
					operation={Operation}
					search={{
						value: key,
						onChange: (e: any) => setKey(e.target.value),
						onSearch: handleSearch,
						placeholder: '请输入存储服务名称搜索'
					}}
					showRefresh
					onRefresh={() => getData(key)}
				>
					{storages.map((item: StorageItem, index: number) => {
						return (
							<ListCard
								key={item.name}
								title={item.aliasName}
								subTitle={item.volumeType}
								icon={
									<img
										src={storageIcon}
										style={{
											marginLeft: 13,
											marginRight: 16
										}}
									/>
								}
								actionRender={
									<Actions>
										<LinkButton
											onClick={() => {
												history.push(
													`/storageManagement/edit/${item.name}/${item.clusterId}/${item.clusterAliasName}`
												);
											}}
										>
											编辑
										</LinkButton>
										<LinkButton
											onClick={() => {
												confirm({
													title: '操作确认',
													content:
														'是否确认删除该存储?',
													onOk: () => {
														const sendData: GetDetailParams =
															{
																clusterId:
																	item.clusterId,
																storageName:
																	item.name
															};
														return deleteStorage(
															sendData
														)
															.then((res) => {
																if (
																	res.success
																) {
																	notification.success(
																		{
																			message:
																				'成功',
																			description:
																				'存储删除成功'
																		}
																	);
																} else {
																	notification.error(
																		{
																			message:
																				'失败',
																			description:
																				res.errorMsg
																		}
																	);
																}
															})
															.finally(() => {
																getData(key);
															});
													}
												});
											}}
										>
											删除
										</LinkButton>
									</Actions>
								}
								titleClick={() => {
									history.push(
										`/storageManagement/${item.name}/${item.aliasName}/${item.clusterId}`
									);
								}}
							>
								<ListCardItem
									label="所属集群"
									value={item.clusterAliasName}
								/>
								<ListCardItem
									label="类型"
									value={item.volumeType}
								/>
								<ListCardItem
									label="存储使用量"
									value={quotaRender(item)}
								/>
							</ListCard>
						);
					})}
				</ProList>
			</ProContent>
		</ProPage>
	);
}
