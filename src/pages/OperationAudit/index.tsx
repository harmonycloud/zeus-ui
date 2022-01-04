import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
	Page,
	Content,
	Header,
	Breadcrumb
} from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import {
	Message,
	Search,
	Icon,
	CascaderSelect,
	Table,
	Button,
	Pagination
} from '@alicloud/console-components';
import styled from 'styled-components';
import { auditProps, sendDataAuditProps } from './audit';
import { filtersProps } from '@/types/comment';
import Storage from '@/utils/storage';
import { getAudits, getModules } from '@/services/audit';
import messageConfig from '@/components/messageConfig';
import './index.scss';
import moment from 'moment';
import { getXY } from './util';

export default function OperationAudit(): JSX.Element {
	const [dataSource, setDataSource] = useState<auditProps[]>([]);
	const [current, setCurrent] = useState<number>(1); // * 页码
	const [total, setTotal] = useState<number | undefined>(10); // * 总数
	const [keyword, setKeyword] = useState<string>(''); // * 关键词搜索
	const [roleFilters, setRoleFilters] = useState<filtersProps[]>([]); // * 角色筛选
	const [methodsFilters, setMethodsFilters] = useState<filtersProps[]>([]); // * 方法筛选
	const [modulesFilters, setModulesFilters] = useState<any[]>([]); // * 版块筛选
	const [casVisible, setCasVisible] = useState<boolean>(false); // * 级联选项框的显隐
	const [roles, setRoles] = useState<string[]>([]); // * 角色筛选保存内容
	const [methods, setMethods] = useState<string[]>([]); // * 方法筛选保存内容
	const [modules, setModules] = useState<string[]>([]); // * 父模块筛选保存内容
	const [childModules, setChildModules] = useState<string[]>([]); // * 子模块筛选保存内容
	const [beginTimeNormalOrder, setBeginTimeNormalOrder] = useState<
		boolean | null
	>(false); // * 排序
	const [executeTimeNormalOrder, setExecuteTimeNormalOrder] = useState<
		boolean | null
	>(); // * 排序
	const [statusOrder, setStatusOrder] = useState<boolean | null>(false);
	// const [showColumnDialog, setShowColumnDialog] = useState(false); // todo 展示column列表
	const history = useHistory();
	const breadcrumb = (
		<Breadcrumb>
			<Breadcrumb.Item>
				<Link to="/systemManagement/operationAudit">系统管理</Link>
			</Breadcrumb.Item>
			<Breadcrumb.Item>操作审计</Breadcrumb.Item>
		</Breadcrumb>
	);
	const [lock, setLock] = useState<any>({ lock: 'right' });
	useEffect(() => {
		// * 获取板块信息
		getModules().then((res) => {
			if (res.success) {
				const rolesTemp = res.data.roles.map((item: string) => {
					const result: filtersProps = {
						label: item,
						value: item
					};
					return result;
				});
				setRoleFilters(rolesTemp);
				const methodsTemp = res.data.methods.map((item: string) => {
					const result: filtersProps = {
						label: item,
						value: item
					};
					return result;
				});
				setMethodsFilters(methodsTemp);
				const modulesTempKeys = Object.keys(res.data.modules);
				const modulesTemp = modulesTempKeys.map((item: string) => {
					const result: filtersProps = {
						label: item,
						value: item,
						children: res.data.modules[item].map((i: string) => {
							return {
								label: i,
								value: i
							};
						})
					};
					return result;
				});
				setModulesFilters(modulesTemp);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		window.onresize = function () {
			document.body.clientWidth >= 2300
				? setLock(null)
				: setLock({ lock: 'right' });
		};
	}, []);
	useEffect(() => {
		// * 获取操作审计列表
		let mounted = true;
		const sendData = {
			current: current,
			size: 10,
			searchKeyWord: keyword,
			roles: roles,
			requestMethods: methods,
			modules,
			childModules,
			beginTimeNormalOrder: beginTimeNormalOrder
		};
		getAudits(sendData).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data.records);
					setCurrent(1);
					setTotal(res.data.total);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			mounted = false;
		};
	}, [keyword]);

	const getAuditLists = (sendData: sendDataAuditProps) => {
		getAudits(sendData).then((res) => {
			if (res.success) {
				setDataSource(res.data.records);
				setTotal(res.data.total);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const handleSearch = (value: string) => {
		setKeyword(value);
	};

	const onRefresh = () => {
		const sendData = {
			current,
			size: 10,
			searchKeyWord: keyword,
			roles: roles,
			requestMethods: methods,
			modules,
			childModules,
			beginTimeNormalOrder: beginTimeNormalOrder
		};
		getAuditLists(sendData);
	};
	const beginTimeRender: (
		value: string,
		index: number,
		record: auditProps
	) => string = (value: string, index: number, record: auditProps) => {
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	const plateRender: (
		value: string,
		index: number,
		record: auditProps
	) => string = (value: string, index: number, record: auditProps) => {
		return `${record.moduleChDesc}/${record.childModuleChDesc}`;
	};
	const actionRender: (
		value: string,
		index: number,
		record: auditProps
	) => JSX.Element = (value: string, index: number, record: auditProps) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push({
							pathname: `/systemManagement/operationAudit/${record.account}`,
							state: {
								...record
							}
						});
						Storage.setSession('audit', record);
					}}
				>
					详情
				</LinkButton>
			</Actions>
		);
	};

	const handleChange = (current: number) => {
		setCurrent(current);
		const sendData = {
			current,
			size: 10,
			searchKeyWord: keyword,
			roles: roles,
			requestMethods: methods,
			modules,
			childModules,
			beginTimeNormalOrder: beginTimeNormalOrder
		};
		getAuditLists(sendData);
	};
	const onFilter = (filterParams: any) => {
		// console.log(filterParams);
		const keys = Object.keys(filterParams);
		const sendData: sendDataAuditProps = {
			current: 1,
			size: 10,
			searchKeyWord: keyword,
			roles: roles,
			requestMethods: methods,
			modules,
			childModules,
			beginTimeNormalOrder: beginTimeNormalOrder
		};
		switch (keys[0]) {
			case 'roleName':
				sendData.roles = filterParams[keys[0]].selectedKeys;
				setRoles(filterParams[keys[0]].selectedKeys);
				break;
			case 'requestMethod':
				sendData.requestMethods = filterParams[keys[0]].selectedKeys;
				setMethods(filterParams[keys[0]].selectedKeys);
				break;
			default:
				break;
		}
		setCurrent(1);
		getAuditLists(sendData);
	};
	const onModuleChange = (value: any, data: any, extra: any) => {
		if (data.children) {
			setModules([value]);
		} else {
			setChildModules([value]);
		}
	};
	const resetModules = () => {
		setCasVisible(false);
		setModules([]);
		setChildModules([]);
	};
	const confirmModules = () => {
		const sendData = {
			current,
			size: 10,
			searchKeyWord: keyword,
			roles: roles,
			requestMethods: methods,
			modules,
			childModules,
			beginTimeNormalOrder: beginTimeNormalOrder
		};
		getAuditLists(sendData);
	};
	useEffect(() => {
		if (!casVisible) {
			confirmModules();
		}
	}, [casVisible]);
	const onSort = (dataIndex: string, order: string) => {
		const sendData: sendDataAuditProps = {
			current: 1,
			size: 10,
			searchKeyWord: keyword,
			roles: roles,
			requestMethods: methods,
			modules,
			childModules,
			beginTimeNormalOrder: beginTimeNormalOrder,
			executeTimeNormalOrder: executeTimeNormalOrder,
			statusOrder: statusOrder
		};
		if (dataIndex === 'executeTime') {
			if (order === 'desc') {
				setExecuteTimeNormalOrder(false);
				setBeginTimeNormalOrder(null);
				setStatusOrder(null);
				sendData.executeTimeNormalOrder = false;
				sendData.beginTimeNormalOrder = null;
				sendData.statusOrder = null;
			} else {
				setExecuteTimeNormalOrder(true);
				setBeginTimeNormalOrder(null);
				setStatusOrder(null);
				sendData.executeTimeNormalOrder = true;
				sendData.beginTimeNormalOrder = null;
				sendData.statusOrder = null;
			}
		} else if (dataIndex === 'beginTime') {
			if (order === 'desc') {
				setBeginTimeNormalOrder(false);
				setExecuteTimeNormalOrder(null);
				setStatusOrder(null);
				sendData.beginTimeNormalOrder = false;
				sendData.executeTimeNormalOrder = null;
				sendData.statusOrder = null;
			} else {
				setBeginTimeNormalOrder(true);
				setExecuteTimeNormalOrder(null);
				setStatusOrder(null);
				sendData.beginTimeNormalOrder = true;
				sendData.executeTimeNormalOrder = null;
				sendData.statusOrder = null;
			}
		} else if (dataIndex === 'status') {
			if (order === 'desc') {
				setStatusOrder(true);
				setBeginTimeNormalOrder(null);
				setExecuteTimeNormalOrder(null);
				sendData.statusOrder = true;
				sendData.beginTimeNormalOrder = null;
				sendData.executeTimeNormalOrder = null;
			} else {
				setStatusOrder(false);
				setBeginTimeNormalOrder(null);
				setExecuteTimeNormalOrder(null);
				sendData.statusOrder = false;
				sendData.beginTimeNormalOrder = null;
				sendData.executeTimeNormalOrder = null;
			}
		}
		setCurrent(1);
		getAuditLists(sendData);
	};

	return (
		<Page style={{ minHeight: 'calc(100% - 43px)' }}>
			<Header title="操作审计" breadcrumb={breadcrumb}></Header>
			<Content>
				<div className="audit-table-header-layout">
					<Search
						onSearch={handleSearch}
						placeholder="请输入登录账户/用户名/登录IP/路径搜索"
						style={{
							width: '360px'
						}}
						hasClear={true}
					/>
					<div>
						{/* <Button
							style={{ marginRight: 8 }}
							onClick={() => setShowColumnDialog(true)}
						>
							<Icon type="set" />
						</Button> */}
						<Button
							onClick={onRefresh}
							style={{ padding: '0 9px' }}
						>
							<Icon type="refresh" />
						</Button>
					</div>
				</div>
				<div id="filter-cas"></div>
				<Table
					dataSource={dataSource}
					primaryKey="key"
					onFilter={onFilter}
					onSort={onSort}
					hasBorder={false}
				>
					<Table.Column
						title="登录账户"
						dataIndex="account"
						lock="left"
						width={120}
					/>
					<Table.Column
						title="用户名"
						dataIndex="userName"
						lock="left"
						width={100}
					/>
					<Table.Column
						title="角色"
						dataIndex="roleName"
						filters={roleFilters}
						filterMode="single"
						lock="left"
						width={100}
					/>
					<Table.Column
						title="登录IP"
						dataIndex="remoteIp"
						width={120}
					/>
					<Table.Column
						title={
							<span id="audit-cas">
								版块{' '}
								<Icon
									type="filter"
									size="xs"
									style={{
										marginLeft: 8,
										color:
											modules.length === 0 &&
											childModules.length === 0
												? '#888'
												: '#0070cc'
									}}
									onClick={() => {
										setCasVisible(true);
									}}
								/>
								<CascaderSelect
									listStyle={{ width: '200px' }}
									visible={casVisible}
									hasArrow={false}
									hasBorder={false}
									hasClear={false}
									expandTriggerType="click"
									dataSource={modulesFilters}
									onChange={onModuleChange}
									placeholder=" "
									displayRender={(labels) => <span></span>}
									changeOnSelect={true}
									popupContainer={'filter-cas'}
									// followTrigger={true}
									onVisibleChange={(visible, type) => {
										const casCurrent =
											document.getElementById(
												'filter-cas'
											);
										// console.log(document.body.scrollTop);
										const x1 =
											(casCurrent as HTMLElement)
												.offsetLeft - 30;
										const x2 =
											(casCurrent as HTMLElement)
												.offsetWidth +
											(casCurrent as HTMLElement)
												.offsetLeft +
											30;
										const y1 =
											(casCurrent as HTMLElement)
												.offsetTop - 43;
										const y2 =
											(casCurrent as HTMLElement)
												.offsetHeight +
											(casCurrent as HTMLElement)
												.offsetTop +
											43;

										// console.log(x1, x2, y1, y2);
										const obj = getXY(window.event);
										// console.log(obj);
										// console.log(window.event.clientX);
										if (
											obj.x < x1 ||
											obj.x > x2 ||
											obj.y < y1 ||
											obj.y > y2
										) {
											setCasVisible(visible);
											confirmModules();
										}
									}}
									footer={
										<div style={{ padding: 12 }}>
											<Button
												type="primary"
												style={{
													marginRight: 8
												}}
												onClick={() =>
													setCasVisible(false)
												}
											>
												确认
											</Button>
											<Button onClick={resetModules}>
												重置
											</Button>
										</div>
									}
								/>
							</span>
						}
						dataIndex="plate"
						cell={plateRender}
						width={200}
					/>
					<Table.Column
						title="行为"
						dataIndex="actionChDesc"
						width={180}
					/>
					<Table.Column title="路径" dataIndex="url" width={300} />
					<Table.Column
						title="方法"
						dataIndex="requestMethod"
						filters={methodsFilters}
						filterMode="multiple"
						width={100}
					/>
					<Table.Column
						title="耗时（ms）"
						dataIndex="executeTime"
						width={150}
						sortable
					/>
					<Table.Column
						title="状态码"
						dataIndex="status"
						width={100}
						sortable
					/>
					<Table.Column
						title="操作时间"
						dataIndex="beginTime"
						width={200}
						cell={beginTimeRender}
						sortable
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						width={100}
						cell={actionRender}
						{...lock}
					/>
				</Table>
				<SPagination
					onChange={handleChange}
					total={total}
					current={current}
					pageSizeSelector={false}
				/>
			</Content>
		</Page>
	);
}
const SPagination = styled(Pagination)`
	margin-top: 10px;
	float: right;
`;
