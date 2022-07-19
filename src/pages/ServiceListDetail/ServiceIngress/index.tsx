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
import { CheckCircleFilled } from '@ant-design/icons';
import nodata from '@/assets/images/nodata.svg';
import storage from '@/utils/storage';

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
		brokerNum
	} = props;
	const history = useHistory();
	const [dataSource, setDataSource] = useState<serviceAvailableItemProps[]>(
		[]
	);
	const [visible, setVisible] = useState<boolean>(false);
	const [internalDataSource, setInternalDataSource] = useState<
		InternalServiceItem[]
	>([]);
	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
					// kfk mq 的添加服务暴露页不同
					if (name === 'kafka' || name === 'rocketmq') {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}`
						);
					} else if (name === 'elasticsearch') {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/es/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
						);
					} else {
						if (mode === 'cluster' && readWriteProxy?.enabled)
							return;
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
			<span className="name-link" onClick={() => setVisible(true)}>
				查看集群内访问
			</span>
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
					name: name,
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
								title={item.name}
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
													history.push(
														`/serviceList/${name}/${aliasName}/externalAccess/edit/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}`
													);
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
													return;
												}
											}}
										>
											编辑
										</LinkButton>
										<LinkButton
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
								title={item.name}
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
													history.push(
														`/serviceList/${name}/${aliasName}/externalAccess/edit/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}`
													);
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
													return;
												}
											}}
										>
											编辑
										</LinkButton>
										<LinkButton
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
						{/* <img
							width={14}
							height={14}
							src={
								current.imagePath
									? `${api}/images/middleware/${current.imagePath}`
									: nodata
							}
						/> */}
						<div style={{ marginLeft: 8 }}>{middlewareName}</div>
					</div>
				}
				placement="right"
				onClose={() => setVisible(false)}
				visible={visible}
				width={500}
			>
				<Table rowKey="serviceName" dataSource={internalDataSource}>
					<Table.Column dataIndex="servicePurpose" title="暴露服务" />
					<Table.Column
						dataIndex="internalAddress"
						title="服务及端口号"
						render={internalAddressRender}
					/>
				</Table>
			</Drawer>
		</>
	);
}
