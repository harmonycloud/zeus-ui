import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Location } from 'history';
import {
	Button,
	Message,
	Dialog,
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
import { protocolFilter } from '@/utils/const';

interface stateProps {
	middlewareName: string;
}
interface serviceAvailableProps {
	globalVar: globalVarProps;
}
function ServiceAvailable(props: serviceAvailableProps) {
	const { cluster, namespace, project } = props.globalVar;
	const [role] = useState(JSON.parse(storage.getLocal('role')));
	const [selected, setSelected] = useState<string>('');
	const [originData, setOriginData] = useState<serviceAvailablesProps[]>([]);
	const [dataSource, setDataSource] = useState<serviceAvailableItemProps[]>(
		[]
	);
	const [showDataSource, setShowDataSource] = useState<
		serviceAvailableItemProps[]
	>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [list, setList] = useState<listProps[]>([]);
	const location: Location<stateProps> = useLocation();
	const [searchText, setSearchText] = useState<string>(
		location?.state?.middlewareName || ''
	);
	const [iconVisible, setIconVisible] = useState<boolean>(false);
	const [adress, setAdress] = useState<string>('');
	const [visibleFlag, setVisibleFlag] = useState<boolean>(false);
	const [lock, setLock] = useState<any>({ lock: 'right' });
	const [record, setRecord] = useState<any>();
	const history = useHistory();

	useEffect(() => {
		const list: listProps[] = [];
		if (role.userRoleList.some((i: any) => i.roleId === 1)) {
			list.push({ name: '全部服务', count: 0 });
			const keys = Object.keys(
				role.userRoleList.find((i: any) => i.roleId === 1)
			);
			keys.forEach((item: string) => {
				list.push({
					name: item,
					count: 0
				});
			});
			setList(list);
			setSelected('全部服务');
		}
	}, []);
	useEffect(() => {
		if (JSON.stringify(project) !== '{}') {
			if (role.userRoleList.every((i: any) => i.roleId !== 1)) {
				const keys = Object.keys(
					role.userRoleList.find(
						(i: any) => i.projectId === project.projectId
					).power
				);
				keys.forEach((item: string) => {
					list.push({
						name: item,
						count: 0
					});
				});
				setList(list);
				setSelected(list[0].name);
			}
		}
	}, [project]);

	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			if (mounted) {
				if (role.roleId === 1) {
					getIngresses({
						clusterId: cluster.id,
						namespace: namespace.name,
						keyword: searchText,
						type: ''
					}).then((res) => {
						console.log(res);
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
				} else {
					console.log(selected);
					getData(selected, '');
				}
				getList({
					projectId: project.projectId,
					clusterId: cluster.id,
					namespace: namespace.name,
					keyword: ''
				}).then((res) => {
					console.log(res);
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
		return () => {
			mounted = false;
		};
	}, [namespace]);
	useEffect(() => {
		window.onresize = function () {
			document.body.clientWidth >= 2300
				? setLock(null)
				: setLock({ lock: 'right' });
		};
	}, []);
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
	const getData = (type: string = selected, keyword: string = searchText) => {
		const sendData = {
			clusterId: cluster.id,
			namespace: namespace.name,
			keyword,
			type
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
	const Operation = {
		primary: (
			<Button
				onClick={() => {
					if (visibleFlag) {
						Message.show(
							messageConfig(
								'error',
								'失败',
								'当前命名空间下无服务'
							)
						);
					} else {
						history.push('/serviceAvailable/addServiceAvailable');
					}
				}}
				type="primary"
			>
				新增
			</Button>
		)
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
							{`${record.protocol}-${record.ingressClassName}`}
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
	if (JSON.stringify(cluster) === '{}' || JSON.stringify(project) === '{}') {
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
							getData(value, '');
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
					onFilter={onFilter}
				>
					<Table.Column
						title="服务名称/中文别名"
						dataIndex="middlewareName"
						width={140}
						lock="left"
						cell={middlewareNameRender}
					/>
					<Table.Column
						title="服务类型"
						dataIndex="middlewareType"
						cell={iconTypeRender}
						width={100}
					/>
					<Table.Column
						title="被暴露服务名"
						dataIndex="name"
						width={190}
					/>
					<Table.Column
						title="被暴露服务端口"
						width={140}
						dataIndex="httpExposePort"
						cell={portRender}
					/>
					<Table.Column
						title="暴露方式"
						dataIndex="exposeType"
						width={110}
						sortable={true}
					/>
					<Table.Column
						width={260}
						title="暴露详情"
						cell={addressRender}
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
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ServiceAvailable);
