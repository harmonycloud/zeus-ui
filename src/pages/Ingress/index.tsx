import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import Table from '@/components/MidTable';
import {
	Button,
	Dialog,
	Message,
	Balloon,
	Icon
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';

import AddServiceAvailableForm from '../ServiceAvailable/AddServiceAvailableForm';

import {
	getIngresses,
	deleteIngress,
	addIngress,
	getIngressMid
} from '@/services/ingress';
import messageConfig from '@/components/messageConfig';
import CustomIcon from '@/components/CustomIcon';

import { instanceType, exposedWay, protocolFilter } from '@/utils/const';
import { StoreState } from '@/types';
import { ingressProps, filtersProps } from '@/types/comment';
import storage from '@/utils/storage';

import './ingress.scss';
import { timeRender } from '@/utils/utils';

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
	const [searchText, setSearchText] = useState<string>('');
	const [active, setActive] = useState<boolean>(false); // 抽屉显示
	const [iconVisible, setIconVisible] = useState<boolean>(false);
	const [adress, setAdress] = useState<string>('');
	const [lock, setLock] = useState<{ lock: string } | null>({
		lock: 'right'
	});
	const history = useHistory();
	useEffect(() => {
		window.onresize = function () {
			document.body.clientWidth >= 2300
				? setLock(null)
				: setLock({ lock: 'right' });
		};
	}, []);

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
			namespace,
			type,
			middlewareName
		};
		getIngressMid(sendData).then((res) => {
			if (res.success) {
				setShowDataSource(res.data);
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const Operation = {
		primary: (
			<Button
				onClick={() => {
					history.push('/serviceAvailable/addServiceAvailable');
					storage.setLocal('isDetail', { middlewareName, type });
				}}
				type="primary"
			>
				新增
			</Button>
		)
	};

	const nameRender = (value: string, index: number, record: ingressProps) => {
		return (
			<>
				<div>{record.name}</div>
				<div
					className="name-link"
					onClick={() => console.log('todetail')}
				>
					{record.middlewareNickName}
				</div>
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
		Dialog.show({
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
							Message.show(
								messageConfig(
									'success',
									'成功',
									'对外路由删除成功'
								)
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
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
		index: number,
		record: ingressProps
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						storage.setLocal('availableRecord', record);
						history.push('/serviceAvailable/addServiceAvailable');
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
		setAdress(record.name as string);
		setIconVisible(true);
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
		setTimeout(() => {
			setIconVisible(false);
		}, 3000);
	};
	const addressRender = (value: string, index: number, record: any) => {
		if (record.exposeType === 'Ingress') {
			let address = '';
			record.protocol === 'TCP'
				? (address = `IngressIp:${record.serviceList[0].exposePort}`)
				: (address = `${record.rules[0].domain}:${record.httpExposePort}${record.rules[0].ingressHttpPaths[0].path}`);
			return (
				<div>
					<div>
						<div>
							&nbsp;&nbsp;&nbsp;&nbsp;
							{record.protocol + '-' + record.ingressClassName}
						</div>
						<div>
							<Balloon
								trigger={
									<CustomIcon
										type="icon-fuzhi"
										size="xs"
										style={{
											color: '#0070CC',
											cursor: 'pointer'
										}}
										onClick={() =>
											copyValue(address, record)
										}
									/>
								}
								triggerType={'click'}
								closable={false}
								visible={iconVisible && adress === record.name}
							>
								<Icon
									type={'success'}
									style={{
										color: '#00A700',
										marginRight: '5px'
									}}
									size={'xs'}
								/>
								复制成功
							</Balloon>
							{address}
						</div>
					</div>
					{record.protocol === 'HTTP' && record.rules.length > 1 && (
						<Balloon
							trigger={
								<span className="tips-more">
									<Icon size="xs" type="ellipsis" />
								</span>
							}
							closable={false}
						>
							{record.rules.map((item: any, index: number) => {
								const address = `${item.domain}:${record.httpExposePort}${item.ingressHttpPaths[0].path}`;
								return (
									<div key={index} className="balloon-tips">
										<div>
											&nbsp;&nbsp;&nbsp;&nbsp;
											{record.protocol +
												'-' +
												record.ingressClassName}
										</div>
										<div>
											<Balloon
												trigger={
													<CustomIcon
														type="icon-fuzhi"
														size="xs"
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
												}
												triggerType={'click'}
												closable={false}
												visible={
													iconVisible &&
													adress === record.name
												}
											>
												&nbsp;&nbsp;&nbsp;&nbsp;
												<Icon
													type={'success'}
													style={{
														color: '#00A700',
														marginRight: '5px'
													}}
													size={'xs'}
												/>
												复制成功
											</Balloon>
											{address}
										</div>
									</div>
								);
							})}
						</Balloon>
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
	const portRender = (value: string, index: number, record: any) => {
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
				Message.show(
					messageConfig('success', '成功', '对外路由添加成功')
				);
				setActive(false);
				getIngressByMid(
					globalVar.cluster.id,
					globalVar.namespace.name,
					type,
					middlewareName
				);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const exposeTypeRender = (value: string, index: number, record: any) => {
		if (record.exposeType === 'NodePort') return value;
		return `${record.exposeType}/${record.ingressClassName || '-'}`;
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const tempDataSource = showDataSource.sort((a, b) => {
				const result = a['createTimeNum'] - b['createTimeNum'];
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setShowDataSource([...tempDataSource]);
		} else if (dataIndex === 'exposeType') {
			const tempDataSource = showDataSource.sort((a, b) => {
				const result = a['exposeType'].length - b['exposeType'].length;
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setShowDataSource([...tempDataSource]);
		}
	};

	return (
		<Page>
			<Content style={{ padding: '0 0', margin: 0 }}>
				<Table
					dataSource={showDataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
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
					primaryKey="key"
					operation={Operation}
					search={null}
					onSort={onSort}
					onFilter={onFilter}
				>
					<Table.Column
						title="被暴露服务名"
						dataIndex="ingressName"
						width={220}
						cell={nameRender}
					/>
					<Table.Column
						title="被暴露服务端口"
						dataIndex="httpExposePort"
						cell={portRender}
						width={120}
					/>
					<Table.Column
						title="暴露方式"
						dataIndex="exposeType"
						width={100}
						sortable={true}
					/>
					<Table.Column
						title="暴露详情"
						cell={addressRender}
						width={200}
					/>
					<Table.Column
						title="创建时间"
						width={160}
						dataIndex="createTime"
						sortable={true}
						cell={timeRender}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={100}
					/>
				</Table>
			</Content>
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
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, null)(IngressList);
