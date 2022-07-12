import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Location } from 'history';

import { Button, Modal, notification, Popover } from 'antd';
import { CheckCircleFilled, EllipsisOutlined } from '@ant-design/icons';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';

import moment from 'moment';
import RapidScreening from '@/components/RapidScreening';
import { listProps } from '@/components/RapidScreening';
import { StoreState, globalVarProps } from '@/types/index';
import {
	serviceAvailableItemProps,
	serviceAvailablesProps
} from './service.available';

import { iconTypeRender, timeRender } from '@/utils/utils';
import { IconFont } from '@/components/IconFont';
import { getIngresses, deleteIngress } from '@/services/ingress';
import storage from '@/utils/storage';
import { getList } from '@/services/serviceList';
import GuidePage from '../GuidePage';

import './index.scss';

interface stateProps {
	middlewareName: string;
}
interface serviceAvailableProps {
	globalVar: globalVarProps;
}
const { LinkButton } = Actions;
function ServiceAvailable(props: serviceAvailableProps) {
	const { cluster, namespace, project } = props.globalVar;
	const [role] = useState(JSON.parse(storage.getLocal('role')));
	const [selected, setSelected] = useState<string>('全部服务');
	const [originData, setOriginData] = useState<serviceAvailablesProps[]>([]);
	const [dataSource, setDataSource] = useState<serviceAvailableItemProps[]>(
		[]
	);
	const [showDataSource, setShowDataSource] = useState<
		serviceAvailableItemProps[]
	>([]);
	const [list, setList] = useState<listProps[]>([
		{ name: '全部服务', count: 0 }
	]);
	const location: Location<stateProps> = useLocation();
	const [searchText, setSearchText] = useState<string>(
		location?.state?.middlewareName || ''
	);
	const [visibleFlag, setVisibleFlag] = useState<boolean>(false);
	const history = useHistory();

	useEffect(() => {
		let mounted = true;
		if (
			JSON.stringify(cluster) !== '{}' &&
			JSON.stringify(namespace) !== '{}'
		) {
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
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
						setOriginData([]);
						setList([{ name: '全部服务', count: 0 }]);
					}
				});
				getList({
					projectId: project.projectId,
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
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		}
		return () => {
			mounted = false;
		};
	}, [cluster, namespace]);
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
		} else {
			setShowDataSource(l);
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
				const listTemp = role.userRoleList.some(
					(i: any) => i.roleId === 1
				)
					? [{ name: '全部服务', count: 0 }]
					: [];
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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const handleSearch = (value: string) => {
		setSearchText(value);
		getData(value);
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
					clusterId: cluster.id,
					middlewareName: record.middlewareName,
					name: record.name,
					namespace: record.namespace
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
						getData();
					});
			}
		});
	};
	const Operation = {
		primary: (
			<Button
				onClick={() => {
					if (visibleFlag) {
						notification.error({
							message: '失败',
							description: '当前命名空间下无服务'
						});
					} else {
						history.push('/serviceAvailable/addServiceAvailable');
					}
				}}
				type="primary"
				// disabled={!operateFlag}
			>
				新增
			</Button>
		)
	};
	// * 浏览器复制到剪切板方法
	const copyValue = (value: any, record: any) => {
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
				? (address = `${record.exposeIP}:${record.serviceList[0].exposePort}`)
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
										<CheckCircleFilled
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
										cursor: 'pointer',
										verticalAlign: 'middle'
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
															&nbsp;&nbsp;&nbsp;&nbsp;
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
													trigger={'click'}
												>
													<IconFont
														type="icon-fuzhi"
														style={{
															color: '#0070CC',
															cursor: 'pointer',
															verticalAlign:
																'middle'
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
	const middlewareNameRender = (
		value: string,
		record: serviceAvailableItemProps,
		index: number
	) => {
		return (
			<div className="display-flex flex-align">
				<div className="middleware-name">
					<div title={record.middlewareName}>
						{record.middlewareName}
					</div>
					<div title={record.middlewareNickName || ''}>
						{record.middlewareNickName}
					</div>
				</div>
			</div>
		);
	};
	const portRender = (value: string, record: any, index: number) => {
		const port =
			record.protocol === 'HTTP'
				? record.rules[0].ingressHttpPaths[0].servicePort
				: record.serviceList[0].servicePort;
		return <span>{port}</span>;
	};
	const judgeInit = (record: any) => {
		if (
			record.middlewareType === 'rocketmq' ||
			record.middlewareType === 'kafka'
		) {
			const initService = [
				`${record.middlewareName}-0-master`,
				`${record.middlewareName}-0-slave`,
				`${record.middlewareName}-1-master`,
				`${record.middlewareName}-1-slave`,
				`${record.middlewareName}-2-master`,
				`${record.middlewareName}-2-slave`,
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
	const actionRender = (_: string, record: any) => {
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
				<LinkButton
					disabled={judgeInit(record)}
					onClick={() => handleDelete(record)}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	if (JSON.stringify(cluster) === '{}' || JSON.stringify(project) === '{}') {
		return <GuidePage />;
	}

	return (
		<ProPage>
			<ProHeader
				title="服务暴露"
				subTitle="通过Nginx-Ingress/NodePort等多种方式对外暴露已发布的不同类型中间件服务"
			/>
			<ProContent>
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
						}
						storage.setSession('service-available-current', value);
					}}
				/>
				<ProTable
					dataSource={showDataSource}
					// exact
					// fixedBarExpandWidth={[24]}
					// affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={() => getData(searchText)}
					rowKey="name"
					operation={Operation}
					search={{
						onSearch: handleSearch,
						// onChange: handleChange,
						placeholder:
							'请输入被暴露服务名、服务名称/中文别名、访问地址或者端口搜索',
						style: {
							width: '430px'
						}
					}}
					// onSort={onSort}
					// onFilter={onFilter}
				>
					<ProTable.Column
						title="服务名称/中文别名"
						dataIndex="middlewareName"
						width={140}
						fixed="left"
						render={middlewareNameRender}
					/>
					<ProTable.Column
						title="服务类型"
						dataIndex="middlewareType"
						render={iconTypeRender}
						width={100}
					/>
					<ProTable.Column
						title="被暴露服务名"
						dataIndex="name"
						width={190}
					/>
					<ProTable.Column
						title="被暴露服务端口"
						width={140}
						dataIndex="httpExposePort"
						render={portRender}
					/>
					<ProTable.Column
						title="暴露方式"
						dataIndex="exposeType"
						width={110}
						sorter={(a: any, b: any) =>
							a.exposeType.length - b.exposeType.length
						}
					/>
					<ProTable.Column
						width={260}
						title="暴露详情"
						render={addressRender}
					/>
					<ProTable.Column
						title="创建时间"
						width={160}
						dataIndex="createTime"
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
				{console.log(showDataSource)}
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ServiceAvailable);
