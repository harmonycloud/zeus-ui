import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import { Select, Button, Tag, Input, notification, Empty, Modal } from 'antd';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Backup from '@/assets/images/backup.svg';

import { ListPanel, ListCardItem } from '@/components/ListCard';
import Actions from '@/components/Actions';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getClusters } from '@/services/common';
import {
	getBackupAddress,
	deleteBackupAddress,
	editBackupAddress
} from '@/services/backup';
import { poolListItem } from '@/types/comment';

const LinkButton = Actions.LinkButton;
const Search = Input.Search;
export default function BackupPosition(): JSX.Element {
	const [selectService, setSelectService] = useState<string>();
	const [poolList, setPoolList] = useState<poolListItem[]>([]);
	const [addressList, setAddressList] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const history = useHistory();

	useEffect(() => {
		getClusters().then((res) => {
			if (!res.data) return;
			setPoolList(res.data);
		});
		getData(keyword);
	}, []);

	const getData = (keyword: string) => {
		getBackupAddress({ keyword }).then((res) => {
			if (res.success) {
				setAddressList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const handleDelete = (id: number, clusterId?: string) => {
		Modal.confirm({
			title: '操作确认',
			content: '备份位置删除后将无法恢复，请确认执行',
			onOk: () => {
				deleteBackupAddress({ id, clusterId }).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '删除成功'
						});
						getData(keyword);
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

	const handleAdd = (item: any) => {
		console.log(
			['xx', 'xx'].find((item) => item === 'xx')
				? ['xx', 'xx']
				: [...['xx', 'xx'], 'xx']
		);
		const sendData = {
			clusterIds: item.clusterIds.find(
				(item: string) => item === selectService
			)
				? item.clusterIds
				: [...item.clusterIds, selectService],
			accessKeyId: item.accessKeyId,
			capacity: item.capacity,
			name: item.name,
			secretAccessKey: item.secretAccessKey,
			type: item.type,
			endpoint: item.endpoint
		};
		editBackupAddress(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '集群添加成功'
				});
				getData(keyword);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	return (
		<ProPage>
			<ProHeader
				title="备份位置"
				subTitle="发布中间件需要使用的备份位置"
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 48,
					style: { background: '#f5f5f5' }
				}}
			/>
			<ProContent>
				<div className="list-header">
					<div className="list-header-left">
						<Button
							type="primary"
							onClick={() =>
								history.push(
									'/backupService/backupPosition/addBackupPosition'
								)
							}
						>
							新增
						</Button>
						<Search
							placeholder="请输入关键字搜索"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							onSearch={(value) => getData(value)}
						/>
					</div>
					<div className="list-header-right">
						<Button
							icon={<ReloadOutlined />}
							onClick={() => getData('')}
						></Button>
					</div>
				</div>
				{addressList.length ? (
					addressList.map((item: any) => {
						return (
							<ListPanel
								title={item.name}
								subTitle={item.type}
								icon={
									<img
										src={Backup}
										style={{
											marginLeft: 13,
											marginRight: 16
										}}
									/>
								}
								key={item.id}
								actionRender={
									<Actions>
										<LinkButton
											onClick={() =>
												history.push(
													`/backupService/backupPosition/addBackupPosition/${item.id}`
												)
											}
										>
											编辑
										</LinkButton>
										<LinkButton
											disabled={addressList.length === 1}
											onClick={() =>
												handleDelete(item.id)
											}
										>
											删除
										</LinkButton>
									</Actions>
								}
								render={
									<>
										<Select
											style={{ width: 260 }}
											placeholder="请选择集群名称"
											value={selectService}
											onChange={(value) =>
												setSelectService(value)
											}
										>
											{poolList.length &&
												poolList.map(
													(item: poolListItem) => {
														return (
															<Select.Option
																value={item.id}
																key={item.id}
															>
																{item.name}
															</Select.Option>
														);
													}
												)}
										</Select>
										<Button
											icon={<PlusOutlined />}
											style={{ marginLeft: 16 }}
											disabled={
												!selectService ||
												!!item.clusterIds.find(
													(res: any) =>
														res === selectService
												)
											}
											onClick={() => handleAdd(item)}
										></Button>
										<div style={{ marginTop: 16 }}>
											{item.clusterIds.map(
												(
													data: string,
													index: number,
													arr: any
												) => {
													return (
														<Tag
															key={item}
															closable={
																arr.length !== 1
															}
															style={{
																padding:
																	'4px 10px'
															}}
															onClose={() =>
																handleDelete(
																	item.id,
																	data
																)
															}
														>
															{
																poolList.find(
																	(res) =>
																		res.id ===
																		data
																)?.name
															}
														</Tag>
													);
												}
											)}
										</div>
									</>
								}
							>
								<ListCardItem
									label="备份地址"
									value={item.endpoint}
									width={200}
								/>
								<ListCardItem
									label="容量"
									value={item.capacity + 'G'}
									width={100}
								/>
								<ListCardItem
									label="所引用备份数"
									value={item.relevanceNum}
									width={100}
								/>
								<ListCardItem
									label="创建时间"
									value={item.createTime}
									width={200}
								/>
							</ListPanel>
						);
					})
				) : (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						style={{ height: '450px', lineHeight: '450px' }}
					/>
				)}
			</ProContent>
		</ProPage>
	);
}
