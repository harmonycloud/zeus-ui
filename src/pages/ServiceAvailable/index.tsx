import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Location } from 'history';
import {
	Button,
	Message,
	Dialog,
	Checkbox,
	Balloon,
	Icon
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import RapidScreening from '@/components/RapidScreening';
import messageConfig from '@/components/messageConfig';
import { listProps } from '@/components/RapidScreening';
import { StoreState, globalVarProps } from '@/types/index';
import {
	serviceAvailableItemProps,
	serviceAvailablesProps
} from './service.available';
import { iconTypeRender, timeRender } from '@/utils/utils';
import CustomIcon from '@/components/CustomIcon';
import { getIngresses, deleteIngress, addIngress } from '@/services/ingress';
import AddServiceAvailableForm from './AddServiceAvailableForm';
import storage from '@/utils/storage';
import { getList } from '@/services/serviceList';
import GuidePage from '../GuidePage';

interface stateProps {
	middlewareName: string;
}
interface serviceAvailableProps {
	globalVar: globalVarProps;
}
function ServiceAvailable(props: serviceAvailableProps) {
	const { cluster, namespace } = props.globalVar;
	const [selected, setSelected] = useState<string>(
		storage.getSession('service-available-current') || '全部服务'
	);
	const [originData, setOriginData] = useState<serviceAvailablesProps[]>([]);
	const [dataSource, setDataSource] = useState<serviceAvailableItemProps[]>(
		[]
	);
	const [showDataSource, setShowDataSource] = useState<
		serviceAvailableItemProps[]
	>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [list, setList] = useState<listProps[]>([
		{ name: '全部服务', count: 0 }
	]);
	const location: Location<stateProps> = useLocation();
	const [searchText, setSearchText] = useState<string>(
		location?.state?.middlewareName || ''
	);
	const [iconVisible, setIconVisible] = useState<boolean>(false);
	const [adress, setAdress] = useState<string>('');
	const [visibleFlag, setVisibleFlag] = useState<boolean>(false);
	const [lock, setLock] = useState<any>({ lock: 'right' });

	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			if (mounted) {
				getIngresses({
					clusterId: cluster.id,
					namespace: namespace.name,
					keyword: searchText
				}).then((res) => {
					if (res.success) {
						setOriginData(res.data);
						const listTemp = [{ name: '全部服务', count: 0 }];
						res.data.forEach((item: serviceAvailablesProps) => {
							listTemp.push({
								name: item.name,
								count: item.serviceNum
							});
						});
						listTemp[0].count = listTemp.reduce(
							(pre, cur: listProps) => {
								return pre + cur.count;
							},
							0
						);
						setList(listTemp);
					} else {
						Message.show(messageConfig('error', '失败', res));
						setOriginData([]);
						setList([{ name: '全部服务', count: 0 }]);
					}
				});
				getList({
					clusterId: cluster.id,
					namespace: namespace.name,
					keyword: ''
				}).then((res) => {
					if (res.success) {
						const flag = res.data.every(
							(item: any) => item.serviceNum === 0
						);
						setVisibleFlag(flag);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		}
		window.onresize = function () {
			document.body.clientWidth >= 2300
				? setLock(null)
				: setLock({ lock: 'right' });
		};
		return () => {
			mounted = false;
		};
	}, [namespace]);
	useEffect(() => {
		const allList: serviceAvailableItemProps[] = [];
		originData.forEach((item) => {
			item.ingressList.length > 0 &&
				item.ingressList.forEach((i) => {
					i.imagePath = item.imagePath;
					allList.push(i);
				});
		});
		const l = allList.sort(
			(a, b) =>
				moment(b.createTime).valueOf() - moment(a.createTime).valueOf()
		);
		setDataSource(l);
		if (originData.length > 0) {
			if (selected !== '全部服务') {
				setShowDataSource(
					originData.filter((item) => item.chartName === selected)[0]
						.ingressList
				);
			} else {
				setShowDataSource(l);
			}
		}
	}, [originData]);
	useEffect(() => {
		if (originData.length > 0) {
			if (selected !== '全部服务') {
				setShowDataSource(
					originData.filter((item) => item.chartName === selected)[0]
						.ingressList
				);
			} else {
				setShowDataSource(dataSource);
			}
		}
	}, [selected]);
	const getData = (keyword: string = searchText) => {
		const sendData = {
			clusterId: cluster.id,
			namespace: namespace.name,
			keyword
		};
		getIngresses(sendData).then((res) => {
			if (res.success) {
				setOriginData(res.data);
				const listTemp = [{ name: '全部服务', count: 0 }];
				res.data.forEach((item: serviceAvailablesProps) => {
					listTemp.push({
						name: item.name,
						count: item.serviceNum
					});
				});
				listTemp[0].count = listTemp.reduce((pre, cur: listProps) => {
					return pre + cur.count;
				}, 0);
				setList(listTemp);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const handleSearch = (value: string) => {
		setSearchText(value);
		getData(value);
	};
	const handleChange = (value: string) => {
		setSearchText(value);
	};
	const handleDelete = (record: serviceAvailableItemProps) => {
		Dialog.show({
			title: '操作确认',
			content:
				'删除对外路由会影响当前正在通过对外地址访问中间件的服务，请确认执行',
			onOk: () => {
				const sendData = {
					...record,
					clusterId: cluster.id,
					middlewareName: record.middlewareName,
					name: record.name,
					namespace: record.namespace
				};
				return deleteIngress(sendData)
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
						getData();
					});
			}
		});
	};
	const onCreate = (values: any) => {
		const sendData =
			values.protocol === 'HTTP'
				? {
						clusterId: cluster.id,
						namespace: namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						ingressClassName: values.ingressClassName,
						protocol: values.protocol,
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
						clusterId: cluster.id,
						namespace: namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						ingressClassName: values.ingressClassName,
						protocol: values.protocol,
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
				setVisible(false);
				getData();
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const Operation = {
		primary: (
			<Button
				onClick={() => {
					if (visibleFlag) {
						Message.show(
							messageConfig(
								'error',
								'失败',
								'当前资源分区下无服务'
							)
						);
					} else {
						setVisible(true);
					}
				}}
				type="primary"
			>
				暴露服务
			</Button>
		)
	};
	const nameRender = (value: string, index: number, record: any) => {
		return <div className="name-link">{value}</div>;
	};
	// * 浏览器复制到剪切板方法
	const copyValue = (value: any, record: any) => {
		const input = document.createElement('input');
		setAdress(record.name);
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
		// Message.show(messageConfig('success', '成功', '复制成功'));
	};
	const addressRender = (value: string, index: number, record: any) => {
		if (record.protocol === 'HTTP') {
			const address = `${record.rules[0].domain}:${record.httpExposePort}${record.rules[0].ingressHttpPaths[0].path}`;
			return (
				<>
					<Balloon
						trigger={
							<CustomIcon
								type="icon-fuzhi"
								size="xs"
								style={{ color: '#0070CC', cursor: 'pointer' }}
								onClick={() => copyValue(address, record)}
							/>
						}
						triggerType={'click'}
						closable={false}
						visible={iconVisible && adress === record.name}
					>
						<Icon
							type={'success'}
							style={{ color: '#00A700', marginRight: '5px' }}
							size={'xs'}
						/>
						复制成功
					</Balloon>
					{address}
				</>
			);
		} else {
			return (
				<div className="ingress-balloon-content">
					<div className="ingress-balloon-list-content">
						{record.serviceList &&
							record.serviceList.map(
								(item: any, index: number) => {
									const address = `${record.exposeIP}:${item.exposePort}`;
									if (index > 1) {
										return null;
									}
									return (
										<div key={index}>
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
									);
								}
							)}
					</div>
					{record.serviceList.length > 2 && (
						<Balloon
							trigger={
								<span className="tips-more">
									<Icon size="xs" type="ellipsis" />
								</span>
							}
							closable={false}
						>
							{record.serviceList.map(
								(item: any, index: number) => {
									const address = `${record.exposeIP}:${item.exposePort}`;
									return (
										<div
											key={index}
											className="balloon-tips"
										>
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
									);
								}
							)}
						</Balloon>
					)}
				</div>
			);
		}
	};
	const middlewareNameRender = (
		value: string,
		index: number,
		record: serviceAvailableItemProps
	) => {
		return (
			<div className="display-flex flex-align">
				{record?.isDisasterRecovery && (
					<div className="gray-circle">备</div>
				)}
				<div>
					<div>{record.middlewareName}</div>
					<div>{record.middlewareNickName}</div>
				</div>
			</div>
		);
	};
	const portRender = (value: string, index: number, record: any) => {
		const port =
			record.protocol === 'HTTP'
				? record.rules[0].ingressHttpPaths[0].servicePort
				: record.serviceList[0].servicePort;
		return <span>{port}</span>;
	};
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton onClick={() => handleDelete(record)}>
					删除
				</LinkButton>
			</Actions>
		);
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
		} else if (dataIndex === 'protocol') {
			const tempDataSource = showDataSource.sort((a, b) => {
				const result = a['protocol'].length - b['protocol'].length;
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
	const exposeTypeRedner = (
		value: string,
		index: number,
		record: serviceAvailableItemProps
	) => {
		return `${value}/${record.ingressClassName || '-'}`;
	};
	if (
		JSON.stringify(cluster) === '{}' &&
		JSON.stringify(namespace) === '{}'
	) {
		return <GuidePage />;
	}
	return (
		<Page>
			<Header
				title="服务暴露"
				subTitle="通过Nginx-Ingress/NodePort等多种方式对外暴露已发布的不同类型中间件服务"
			/>
			<Content>
				<RapidScreening
					list={list}
					selected={selected}
					changeSelected={(value: string) => {
						setSelected(value);
						if (
							location.state &&
							location.state.middlewareName !== ''
						) {
							setSearchText('');
							location.state.middlewareName = '';
							getData('');
						}
						storage.setSession('service-available-current', value);
					}}
				/>
				<Table
					dataSource={showDataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={() => getData(searchText)}
					primaryKey="key"
					operation={Operation}
					search={{
						defaultValue: searchText,
						value: searchText,
						onSearch: handleSearch,
						onChange: handleChange,
						placeholder:
							'请输入暴露路由名称、服务名称/中文别名、访问地址搜索'
					}}
					searchStyle={{
						width: '370px'
					}}
					onSort={onSort}
				>
					<Table.Column
						title="暴露服务名称"
						dataIndex="name"
						// cell={nameRender}
						width={190}
						lock="left"
					/>
					<Table.Column
						title="服务名称/中文别名"
						dataIndex="middlewareName"
						width={140}
						cell={middlewareNameRender}
					/>
					<Table.Column
						title="服务类型"
						dataIndex="middlewareType"
						cell={iconTypeRender}
						width={130}
					/>
					<Table.Column
						title="暴露方式"
						dataIndex="exposeType"
						cell={exposeTypeRedner}
						width={210}
						sortable={true}
					/>
					<Table.Column
						title="协议"
						width={80}
						dataIndex="protocol"
						sortable={true}
					/>
					<Table.Column
						width={200}
						title="访问地址"
						cell={addressRender}
					/>
					<Table.Column
						title="实例端口"
						width={100}
						dataIndex="httpExposePort"
						cell={portRender}
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
						width={70}
						{...lock}
					/>
				</Table>
			</Content>
			{visible && (
				<AddServiceAvailableForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={onCreate}
					cluster={cluster}
					namespace={namespace.name}
					middlewareName={location?.state?.middlewareName || ''}
				/>
			)}
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ServiceAvailable);
