import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ProList from '@/components/ProList';
import {
	Button,
	Drawer,
	Modal,
	notification,
	Popover,
	Space,
	Table
} from 'antd';
import { ListCard, ListCardItem, ListPanel } from '@/components/ListCard';
import ArrowLine from '@/components/ArrowLine';
import Actions from '@/components/Actions';
import { IconFont } from '@/components/IconFont';
import { InternalServiceItem, ServiceDetailIngressProps } from '../detail';
import DefaultPicture from '@/components/DefaultPicture';
import {
	getIngressMid,
	deleteIngress,
	getInternalServices
} from '@/services/ingress';
import otherColor from '@/assets/images/nodata.svg';
import { serviceAvailableItemProps } from '@/pages/ServiceAvailable/service.available';
import { api } from '@/api.json';
import { copyValue } from '@/utils/utils';
import { CheckCircleFilled, ReloadOutlined } from '@ant-design/icons';
import nodata from '@/assets/images/nodata.svg';
import storage from '@/utils/storage';
import EditPortForm from './EditPortForm';

const LinkButton = Actions.LinkButton;
export default function ServiceDetailIngress(
	props: ServiceDetailIngressProps
): JSX.Element {
	const {
		name,
		aliasName,
		middlewareName,
		namespace,
		chartVersion,
		customMid,
		capabilities,
		clusterId,
		mode,
		readWriteProxy,
		brokerNum,
		enableExternal,
		imagePath
	} = props;
	const history = useHistory();
	const [dataSource, setDataSource] = useState<serviceAvailableItemProps[]>(
		[]
	);
	const [visible, setVisible] = useState<boolean>(false);
	const [internalDataSource, setInternalDataSource] = useState<
		InternalServiceItem[]
	>([]);
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const onRefresh = () => {
		getIngressByMid(clusterId, namespace, name, middlewareName);
	};
	const Operation = {
		primary: (
			<Button
				type="primary"
				disabled={mode === 'cluster' && !readWriteProxy?.enabled}
				onClick={() => {
					// kfk mq 的添加服务暴露页不同
					if (name === 'kafka' || name === 'rocketmq') {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}/${enableExternal}`
						);
					} else if (name === 'elasticsearch') {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/es/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
						);
					} else if (name === 'mysql' || name === 'redis') {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/msrdpgzk/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}/${readWriteProxy?.enabled}`
						);
					} else {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/msrdpgzk/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
						);
					}
				}}
			>
				新增
			</Button>
		),
		secondary: (
			<Space>
				<span className="name-link" onClick={() => setVisible(true)}>
					查看集群内访问
				</span>
				<Button
					onClick={onRefresh}
					style={{ padding: '0 9px', marginRight: '8px' }}
				>
					<ReloadOutlined />
				</Button>
			</Space>
		)
	};
	useEffect(() => {
		getIngressByMid(clusterId, namespace, name, middlewareName);
		getInternalService();
	}, []);
	const getInternalService = () => {
		getInternalServices({
			clusterId,
			namespace,
			middlewareType: name,
			middlewareName
		}).then((res) => {
			if (res.success) {
				setInternalDataSource(res.data);
			}
		});
	};

	const getIngressByMid = (
		clusterId: string,
		namespace: string,
		type: string,
		middlewareName: string
	) => {
		const sendData = {
			clusterId,
			namespace: namespace,
			type,
			middlewareName
		};
		getIngressMid(sendData).then((res) => {
			if (res.success) {
				console.log(res);
				setDataSource(res.data);
			}
		});
	};
	const handleDelete = (record: serviceAvailableItemProps) => {
		Modal.confirm({
			title: '操作确认',
			content:
				'删除对外路由会影响当前正在通过对外地址访问中间件的服务，请确认执行',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				const sendData = {
					...record,
					clusterId: clusterId,
					middlewareName: middlewareName,
					name: record.name,
					namespace: namespace
				};
				return deleteIngress(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '对外路由删除成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getIngressByMid(
							clusterId,
							namespace,
							name,
							middlewareName
						);
					});
			}
		});
	};
	const judgeInit = (record: any) => {
		if (
			record.middlewareType === 'rocketmq' ||
			record.middlewareType === 'kafka'
		) {
			const initService = [
				`${record.middlewareName}-0-master`,
				`${record.middlewareName}-1-master`,
				`${record.middlewareName}-2-master`,
				`${record.middlewareName}-nameserver-proxy-svc`
			];
			if (record.middlewareType === 'rocketmq') {
				return initService.some((item) => record.name.includes(item));
			} else {
				if (
					record.name.includes(
						`${record.serviceName}-kafka-external-svc`
					)
				) {
					return true;
				} else {
					return false;
				}
			}
		} else {
			return false;
		}
	};
	const ipValue = (record: serviceAvailableItemProps) => {
		if (record.protocol === 'HTTP') return record?.rules[0].domain;
		if (record.exposeType === 'NodePort')
			return `${record.exposeIP}:${record?.serviceList[0]?.exposePort}`;
		if (record.address)
			return `${record.address}:${record?.serviceList[0]?.exposePort}`;
		return record.serviceList[0]?.exposePort;
	};
	const internalAddressRender = (value: string) => {
		return (
			<span>
				{value}
				<Popover
					content={
						<div>
							<CheckCircleFilled
								style={{
									color: '#00A700',
									marginRight: '5px'
								}}
							/>
							复制成功
						</div>
					}
					trigger="click"
				>
					<IconFont
						className="card-ip-copy"
						type="icon-fuzhi1"
						style={{
							fontSize: 12
						}}
						onClick={() => copyValue(value)}
					/>
				</Popover>
			</span>
		);
	};
	// * 当前中间件为自定义中间件时，且后端所传的capabilities包含ingress，则显示该页面的功能
	if (customMid && !capabilities.includes('ingress')) {
		return <DefaultPicture />;
	}
	return (
		<>
			<ProList operation={Operation}>
				{dataSource.map((item: serviceAvailableItemProps) => {
					if (
						item.protocol === 'TCP' &&
						item.exposeType === 'Ingress' &&
						item.address === null
					) {
						return (
							<ListPanel
								key={item.name}
								title={item.middlewareName}
								subTitle={item.middlewareType}
								icon={
									<img
										height={34}
										width={34}
										style={{ marginRight: 8 }}
										src={
											item.imagePath
												? `${api}/images/middleware/${item.imagePath}`
												: otherColor
										}
										alt={name}
									/>
								}
								actionRender={
									<Actions>
										<LinkButton
											onClick={() => {
												if (
													name === 'kafka' ||
													name === 'rocketmq'
												) {
													storage.setSession(
														'serviceIngress',
														item
													);
													if (judgeInit(item)) {
														setEditVisible(true);
													} else {
														history.push(
															`/serviceList/${name}/${aliasName}/externalAccess/edit/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}/${enableExternal}`
														);
													}
												} else if (
													name === 'elasticsearch'
												) {
													storage.setSession(
														'serviceIngress',
														item
													);
													history.push(
														`/serviceList/${name}/${aliasName}/externalAccess/edit/es/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
													);
												} else {
													storage.setSession(
														'serviceIngress',
														item
													);
													history.push(
														`/serviceList/${name}/${aliasName}/externalAccess/edit/msrdpgzk/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
													);
												}
											}}
										>
											编辑
										</LinkButton>
										<LinkButton
											disabled={judgeInit(item)}
											onClick={() => handleDelete(item)}
										>
											删除
										</LinkButton>
									</Actions>
								}
								columnGap="24px"
								render={
									<>
										<Space wrap>
											{item.ingressPodList?.map((i) => {
												return (
													<div
														key={i.podName}
														className="pod-card-item"
													>
														<IconFont
															type="icon-duankou"
															style={{
																fontSize: 32,
																marginRight: 8
															}}
														/>
														<div className="pod-card-des">
															<div className="pod-card-ip">
																{i.hostIp}:
																{
																	item
																		.serviceList[0]
																		.exposePort
																}
																<Popover
																	content={
																		<div>
																			<CheckCircleFilled
																				style={{
																					color: '#00A700',
																					marginRight:
																						'5px'
																				}}
																			/>
																			复制成功
																		</div>
																	}
																	trigger="click"
																>
																	<IconFont
																		className="pod-card-ip-copy"
																		type="icon-fuzhi1"
																		style={{
																			fontSize: 12
																		}}
																		onClick={() =>
																			copyValue(
																				`${i.hostIp}:${item.serviceList[0].exposePort}`
																			)
																		}
																	/>
																</Popover>
															</div>
															<div
																className="pod-card-name"
																title={
																	i.podName
																}
															>
																{i.podName}
															</div>
														</div>
													</div>
												);
											})}
										</Space>
									</>
								}
							>
								<ArrowLine
									width="calc((100% - 350px) / 2)"
									label={item.servicePurpose || '未知'}
								/>
								<ListCardItem
									width={100}
									label="暴露方式"
									value={
										item.exposeType === 'Ingress'
											? item.protocol
											: item.exposeType
									}
								/>
								<ArrowLine width="calc((100% - 350px) / 2)" />
								<ListCardItem
									width={250}
									label={
										item.networkModel === 4
											? '四层网络暴露'
											: '七层网络暴露'
									}
									value={item.serviceList[0].exposePort}
									icon={
										<IconFont
											type="icon-duankou"
											style={{
												fontSize: 32,
												marginRight: 8
											}}
										/>
									}
								/>
							</ListPanel>
						);
					} else {
						return (
							<ListCard
								key={item.name}
								title={item.middlewareName}
								subTitle={item.middlewareType}
								icon={
									<img
										height={32}
										width={32}
										style={{ marginRight: 8 }}
										src={
											item.imagePath
												? `${api}/images/middleware/${item.imagePath}`
												: otherColor
										}
										alt={name}
									/>
								}
								actionRender={
									<Actions>
										<LinkButton
											onClick={() => {
												if (
													name === 'kafka' ||
													name === 'rocketmq'
												) {
													storage.setSession(
														'serviceIngress',
														item
													);
													if (judgeInit(item)) {
														setEditVisible(true);
													} else {
														history.push(
															`/serviceList/${name}/${aliasName}/externalAccess/edit/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}`
														);
													}
												} else if (
													name === 'elasticsearch'
												) {
													storage.setSession(
														'serviceIngress',
														item
													);
													history.push(
														`/serviceList/${name}/${aliasName}/externalAccess/edit/es/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
													);
												} else {
													storage.setSession(
														'serviceIngress',
														item
													);
													history.push(
														`/serviceList/${name}/${aliasName}/externalAccess/edit/msrdpgzk/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
													);
												}
											}}
										>
											编辑
										</LinkButton>
										<LinkButton
											disabled={judgeInit(item)}
											onClick={() => handleDelete(item)}
										>
											删除
										</LinkButton>
									</Actions>
								}
								columnGap="24px"
							>
								<ArrowLine
									width="calc((100% - 350px) / 2)"
									label={item.servicePurpose || '未知'}
								/>
								<ListCardItem
									width={100}
									label="暴露方式"
									value={
										item.exposeType === 'Ingress'
											? item.protocol
											: item.exposeType
									}
								/>
								<ArrowLine width="calc((100% - 350px) / 2)" />
								<ListCardItem
									width={250}
									label={
										item.networkModel === 4
											? '四层网络暴露'
											: '七层网络暴露'
									}
									value={
										<span>
											{ipValue(item)}
											<Popover
												content={
													<div>
														<CheckCircleFilled
															style={{
																color: '#00A700',
																marginRight:
																	'5px'
															}}
														/>
														复制成功
													</div>
												}
												trigger="click"
											>
												<IconFont
													className="card-ip-copy"
													type="icon-fuzhi1"
													style={{
														fontSize: 12
													}}
													onClick={() =>
														copyValue(ipValue(item))
													}
												/>
											</Popover>
										</span>
									}
									icon={
										<IconFont
											type="icon-duankou"
											style={{
												fontSize: 32,
												marginRight: 8
											}}
										/>
									}
								/>
							</ListCard>
						);
					}
				})}
			</ProList>
			<Drawer
				title={
					<div className="icon-type-content">
						<img
							width={14}
							height={14}
							src={
								imagePath
									? `${api}/images/middleware/${imagePath}`
									: nodata
							}
						/>
						<div style={{ marginLeft: 8 }}>{middlewareName}</div>
					</div>
				}
				placement="right"
				onClose={() => setVisible(false)}
				visible={visible}
				width={600}
			>
				<Table rowKey="serviceName" dataSource={internalDataSource}>
					<Table.Column
						width={100}
						dataIndex="servicePurpose"
						title="暴露服务"
					/>
					<Table.Column
						dataIndex="internalAddress"
						title="服务及端口号"
						render={internalAddressRender}
					/>
				</Table>
			</Drawer>
			{editVisible && (
				<EditPortForm
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					onRefresh={onRefresh}
				/>
			)}
		</>
	);
}
