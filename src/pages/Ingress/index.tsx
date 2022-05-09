import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Button, notification, Modal, Popover } from 'antd';
import { CheckCircleOutlined, EllipsisOutlined } from '@ant-design/icons';
import ProTable from '@/components/ProTable';
import { ProPage, ProContent } from '@/components/ProPage';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';

import AddServiceAvailableForm from '../ServiceAvailable/AddServiceAvailableForm';

import { deleteIngress, addIngress, getIngressMid } from '@/services/ingress';
import { IconFont } from '@/components/IconFont';

import { StoreState } from '@/types';
import { ingressProps } from '@/types/comment';
import storage from '@/utils/storage';

import './ingress.scss';
import { timeRender } from '@/utils/utils';

const LinkButton = Actions.LinkButton;
function IngressList(props: ingressProps) {
	const {
		globalVar,
		entry = 'menu',
		type = '',
		middlewareName = '',
		namespace
	} = props;
	const [dataSource, setDataSource] = useState<ingressProps[]>([]);
	const [showDataSource, setShowDataSource] = useState<ingressProps[]>([]);
	const [active, setActive] = useState<boolean>(false); // 抽屉显示
	const history = useHistory();
	const params: any = useParams();

	useEffect(() => {
		if (
			JSON.stringify(globalVar.cluster) !== '{}' &&
			JSON.stringify(globalVar.namespace) !== '{}'
		) {
			getIngressByMid(
				globalVar.cluster.id,
				namespace,
				type,
				middlewareName
			);
		}
	}, [globalVar]);

	const getIngressByMid = (
		clusterId: string,
		namespace: string,
		type: string,
		middlewareName: string
	) => {
		const sendData = {
			clusterId,
			namespace: params.namespace,
			type,
			middlewareName
		};
		getIngressMid(sendData).then((res) => {
			if (res.success) {
				setShowDataSource(res.data);
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const Operation = {
		primary: (
			<Button
				onClick={() =>
					history.push(
						`/serviceList/${params.name}/${params.aliasName}/externalAccess/addExternalAccess/${middlewareName}/${type}/${params.chartVersion}/${namespace}`
					)
				}
				type="primary"
			>
				新增
			</Button>
		)
	};

	const nameRender = (value: string, record: ingressProps, index: number) => {
		return (
			<>
				<div>{record.name}</div>
				<div>{record.middlewareNickName}</div>
			</>
		);
	};

	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = dataSource.filter(
				(item) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
	};
	const handleDelete = (record: ingressProps) => {
		Modal.confirm({
			title: '操作确认',
			content:
				'删除对外路由会影响当前正在通过对外地址访问中间件的服务，请确认执行',
			onOk: () => {
				const sendData = {
					...record,
					clusterId: globalVar.cluster.id,
					middlewareName: record.middlewareName,
					name: record.name,
					namespace: record.namespace
				};
				deleteIngress(sendData)
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
							globalVar.cluster.id,
							globalVar.namespace.name,
							type,
							middlewareName
						);
					});
			}
		});
	};
	const actionRender = (
		value: string,
		record: ingressProps,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						storage.setLocal('availableRecord', record);
						history.push(
							`/serviceList/${params.name}/${params.aliasName}/externalAccess/addExternalAccess/${middlewareName}/${type}/${params.chartVersion}/${namespace}`
						);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton onClick={() => handleDelete(record)}>
					删除
				</LinkButton>
			</Actions>
		);
	};
	// * 浏览器复制到剪切板方法
	const copyValue = (value: string, record: ingressProps) => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.style.position = 'absolute';
		input.style.top = '0px';
		input.style.opacity = '0';
		input.value = value;
		input.focus();
		input.select();
		if (document.execCommand('copy')) {
			document.execCommand('copy');
		}
		input.blur();
		document.body.removeChild(input);
	};
	const addressRender = (value: string, record: any, index: number) => {
		if (record.exposeType === 'Ingress') {
			let address = '';
			record.protocol === 'TCP'
				? (address = `IngressIp:${record.serviceList[0].exposePort}`)
				: (address = `${record.rules[0].domain}:${record.httpExposePort}${record.rules[0].ingressHttpPaths[0].path}`);
			return (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<div>
						<div>
							&nbsp;&nbsp;&nbsp;&nbsp;
							{`${record.protocol}-${
								record.ingressClassName || ''
							}`}
						</div>
						<div className="address">
							<Popover
								content={
									<div>
										<CheckCircleOutlined
											style={{
												color: '#00A700',
												marginRight: '5px'
											}}
										/>
										复制成功
									</div>
								}
								trigger={'click'}
							>
								<IconFont
									type="icon-fuzhi"
									style={{
										color: '#0070CC',
										cursor: 'pointer'
									}}
									onClick={() => copyValue(address, record)}
								/>
							</Popover>
							<span title={address}>{address}</span>
						</div>
					</div>
					{record.protocol === 'HTTP' && record.rules.length > 1 && (
						<Popover
							content={record.rules.map(
								(item: any, index: number) => {
									const address = `${item.domain}:${record.httpExposePort}${item.ingressHttpPaths[0].path}`;
									return (
										<div
											key={index}
											className="balloon-tips"
										>
											<div>
												&nbsp;&nbsp;&nbsp;&nbsp;
												{record.protocol +
													'-' +
													record.ingressClassName}
											</div>
											<div className="address">
												<Popover
													content={
														<div>
															<CheckCircleOutlined
																style={{
																	color: '#00A700',
																	marginRight:
																		'5px'
																}}
															/>
															复制成功
														</div>
													}
													trigger={'click'}
												>
													&nbsp;&nbsp;&nbsp;&nbsp;
													<IconFont
														type="icon-fuzhi"
														style={{
															color: '#0070CC',
															cursor: 'pointer'
														}}
														onClick={() =>
															copyValue(
																address,
																record
															)
														}
													/>
												</Popover>
												<span title={address}>
													{address}
												</span>
											</div>
										</div>
									);
								}
							)}
						>
							<span className="tips-more">
								<EllipsisOutlined />
							</span>
						</Popover>
					)}
				</div>
			);
		} else {
			return (
				<div>
					&nbsp;&nbsp;&nbsp;&nbsp;端口：
					{record.serviceList[0].exposePort}
				</div>
			);
		}
	};
	const portRender = (value: string, record: any, index: number) => {
		const port =
			record.protocol === 'HTTP'
				? record.rules[0].ingressHttpPaths[0].servicePort
				: record.serviceList[0].servicePort;
		return <span>{port}</span>;
	};
	const onCreate = (values: any) => {
		const sendData =
			values.protocol === 'HTTP'
				? {
						clusterId: globalVar.cluster.id,
						namespace: globalVar.namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						protocol: values.protocol,
						ingressClassName: values.ingressClassName,
						rules: [
							{
								domain: values.domain,
								ingressHttpPaths: [
									{
										path: values.path,
										serviceName: values.serviceName,
										servicePort: values.servicePort
									}
								]
							}
						]
				  }
				: {
						clusterId: globalVar.cluster.id,
						namespace: globalVar.namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						protocol: values.protocol,
						ingressClassName: values.ingressClassName,
						serviceList: [
							{
								exposePort: values.exposePort,
								serviceName: values.serviceName,
								servicePort: values.servicePort,
								targetPort:
									values.selectedService.portDetailDtoList[0]
										.targetPort
							}
						]
				  };
		addIngress(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '对外路由添加成功'
				});
				setActive(false);
				getIngressByMid(
					globalVar.cluster.id,
					globalVar.namespace.name,
					type,
					middlewareName
				);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	// const exposeTypeRender = (value: string, index: number, record: any) => {
	// 	if (record.exposeType === 'NodePort') return value;
	// 	return `${record.exposeType}/${record.ingressClassName || '-'}`;
	// };
	// const onSort = (dataIndex: string, order: string) => {
	// 	if (dataIndex === 'createTime') {
	// 		const tempDataSource = showDataSource.sort((a, b) => {
	// 			const result = a['createTimeNum'] - b['createTimeNum'];
	// 			return order === 'asc'
	// 				? result > 0
	// 					? 1
	// 					: -1
	// 				: result > 0
	// 				? -1
	// 				: 1;
	// 		});
	// 		setShowDataSource([...tempDataSource]);
	// 	} else if (dataIndex === 'exposeType') {
	// 		const tempDataSource = showDataSource.sort((a, b) => {
	// 			const result = a['exposeType'].length - b['exposeType'].length;
	// 			return order === 'asc'
	// 				? result > 0
	// 					? 1
	// 					: -1
	// 				: result > 0
	// 				? -1
	// 				: 1;
	// 		});
	// 		setShowDataSource([...tempDataSource]);
	// 	}
	// };

	return (
		<ProPage>
			<ProContent style={{ padding: '0 0', margin: 0 }}>
				<ProTable
					dataSource={showDataSource}
					// exact
					// fixedBarExpandWidth={[24]}
					// affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={() =>
						getIngressByMid(
							globalVar.cluster.id,
							globalVar.namespace.name,
							type,
							middlewareName
						)
					}
					rowKey="name"
					operation={Operation}
					// onSort={onSort}
					// onFilter={onFilter}
				>
					<ProTable.Column
						title="被暴露服务名"
						dataIndex="ingressName"
						width={200}
						render={nameRender}
					/>
					<ProTable.Column
						title="被暴露服务端口"
						dataIndex="httpExposePort"
						render={portRender}
						width={120}
					/>
					<ProTable.Column
						title="暴露方式"
						dataIndex="exposeType"
						width={100}
						// sortable={true}
						sorter={(a: any, b: any) =>
							a.exposeType.length - b.exposeType.length
						}
					/>
					<ProTable.Column
						title="暴露详情"
						render={addressRender}
						width={200}
					/>
					<ProTable.Column
						title="创建时间"
						width={160}
						dataIndex="createTime"
						// sortable={true}
						sorter={(a: any, b: any) =>
							new Date(a.createTime).getTime() -
							new Date(b.createTime).getTime()
						}
						render={timeRender}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						render={actionRender}
						width={100}
					/>
				</ProTable>
			</ProContent>
			{active && (
				<AddServiceAvailableForm
					visible={active}
					onCreate={onCreate}
					onCancel={() => setActive(false)}
					cluster={globalVar.cluster}
					namespace={globalVar.namespace.name}
					middlewareName={middlewareName}
				/>
			)}
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, null)(IngressList);
