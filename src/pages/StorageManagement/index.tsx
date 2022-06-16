import React, { useEffect, useState } from 'react';
import { Space, Button, Select, notification } from 'antd';
import { useHistory } from 'react-router';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import { ListCard, ListCardItem } from '@/components/ListCard';
import Actions from '@/components/Actions';
import ProList from '@/components/ProList';
import storageIcon from '@/assets/images/storage-manage.svg';
import { getLists, getTypes } from '@/services/storage';
import { getClusters } from '@/services/common';
import { clusterType } from '@/types';
import { GetParams, StorageItem } from './storageManage';

const LinkButton = Actions.LinkButton;
const { Option } = Select;
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
		getData();
	}, [selectedClusterId, selectedType]);
	const getData = (keyword = key) => {
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
	const clusterRender = (record: StorageItem) =>
		clusterList.find((item: clusterType) => item.id === record.clusterId)
			?.nickname || '';
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
					onRefresh={getData}
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
										<LinkButton>编辑</LinkButton>
										<LinkButton>删除</LinkButton>
									</Actions>
								}
							>
								<ListCardItem label="状态" value="正常" />
								<ListCardItem
									label="所属集群"
									render={() => clusterRender(item)}
								/>
								<ListCardItem
									label="存储容量"
									value="12.2GB/61.11GB"
								/>
							</ListCard>
						);
					})}
					<ListCard
						title="lvm存储"
						subTitle="CSI-Plugin"
						icon={
							<img
								src={storageIcon}
								style={{ marginLeft: 13, marginRight: 16 }}
							/>
						}
						actionRender={
							<Actions>
								<LinkButton>编辑</LinkButton>
								<LinkButton>删除</LinkButton>
							</Actions>
						}
					>
						<ListCardItem label="状态" value="正常" />
						<ListCardItem label="所属集群" value="140集群" />
						<ListCardItem label="存储容量" value="12.2GB/61.11GB" />
					</ListCard>
				</ProList>
			</ProContent>
		</ProPage>
	);
}
