import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { notification, TablePaginationConfig } from 'antd';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import { getAudits, getModules } from '@/services/audit';
import Storage from '@/utils/storage';
import { defaultValueRender } from '@/utils/utils';
import { auditProps, sendDataAuditProps } from './audit';
import { FiltersProps } from '@/types/comment';
import './index.scss';
const LinkButton = Actions.LinkButton;
export default function OperationAudit(): JSX.Element {
	const [dataSource, setDataSource] = useState<auditProps[]>([]);
	const [current, setCurrent] = useState<number>(1); // * 页码
	const [total, setTotal] = useState<number | undefined>(10); // * 总数
	const [pageSize, setPageSize] = useState<number>(); // * 每页条数
	const [keyword, setKeyword] = useState<string>(''); // * 关键词搜索
	const [roleFilters, setRoleFilters] = useState<FiltersProps[]>([]); // * 角色筛选
	const [methodsFilters, setMethodsFilters] = useState<FiltersProps[]>([]); // * 方法筛选
	const [modulesFilters, setModulesFilters] = useState<any[]>([]); // * 版块筛选
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
	const history = useHistory();
	useEffect(() => {
		// * 获取板块信息
		getModules().then((res) => {
			if (res.success) {
				const rolesTemp = res.data.roles.map((item: string) => {
					const result: FiltersProps = {
						text: item,
						value: item
					};
					return result;
				});
				setRoleFilters(rolesTemp);
				const methodsTemp = res.data.methods.map((item: string) => {
					const result: FiltersProps = {
						text: item,
						value: item
					};
					return result;
				});
				setMethodsFilters(methodsTemp);
				const modulesTempKeys = Object.keys(res.data.modules);
				const modulesTemp = modulesTempKeys.map((item: string) => {
					const result: FiltersProps = {
						text: item,
						value: item,
						children: res.data.modules[item].map((i: string) => {
							return {
								text: i,
								value: i
							};
						})
					};
					return result;
				});
				setModulesFilters(modulesTemp);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
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
			beginTimeNormalOrder: false
		};
		getAudits(sendData).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data.records);
					setCurrent(1);
					setTotal(res.data.total);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
			beginTimeNormalOrder: beginTimeNormalOrder,
			statusOrder: statusOrder,
			executeTimeNormalOrder: executeTimeNormalOrder
		};
		getAuditLists(sendData);
	};
	const beginTimeRender: (
		value: string,
		record: auditProps,
		index: number
	) => string = (value: string, record: auditProps, index: number) => {
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	const plateRender: (
		value: string,
		record: auditProps,
		index: number
	) => string = (value: string, record: auditProps, index: number) => {
		return `${record.moduleChDesc}/${record.childModuleChDesc}`;
	};
	const actionRender: (
		value: string,
		record: auditProps,
		index: number
	) => JSX.Element = (value: string, record: auditProps, index: number) => {
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
	const handleTableChange = (
		pagination: TablePaginationConfig,
		filters: any,
		sorter: any
	) => {
		let beginTimeNormalOrderTemp: boolean | null = null;
		let statusOrderTemp: boolean | null = null;
		let executeTimeNormalOrderTemp: boolean | null = null;
		if (JSON.stringify(sorter) === '{}' || sorter.order === undefined) {
			beginTimeNormalOrderTemp = false;
			statusOrderTemp = null;
			executeTimeNormalOrderTemp = null;
			setBeginTimeNormalOrder(false);
			setExecuteTimeNormalOrder(null);
			setStatusOrder(null);
		} else {
			switch (sorter.field) {
				case 'beginTime':
					beginTimeNormalOrderTemp =
						sorter.order === 'ascend' ? true : false;
					executeTimeNormalOrderTemp = null;
					statusOrderTemp = null;
					setBeginTimeNormalOrder(
						sorter.order === 'ascend' ? true : false
					);
					setExecuteTimeNormalOrder(null);
					setStatusOrder(null);
					break;
				case 'status':
					statusOrderTemp = sorter.order === 'ascend' ? true : false;
					beginTimeNormalOrderTemp = null;
					executeTimeNormalOrderTemp = null;
					setBeginTimeNormalOrder(null);
					setExecuteTimeNormalOrder(null);
					setStatusOrder(sorter.order === 'ascend' ? true : false);
					break;
				case 'executeTime':
					executeTimeNormalOrderTemp =
						sorter.order === 'ascend' ? true : false;
					beginTimeNormalOrderTemp = null;
					statusOrderTemp = null;
					setBeginTimeNormalOrder(null);
					setExecuteTimeNormalOrder(
						sorter.order === 'ascend' ? true : false
					);
					setStatusOrder(null);
					break;
				default:
					break;
			}
		}
		const sendData = {
			current: pagination.current || 1,
			size: pagination.pageSize || 10,
			searchKeyWord: keyword,
			roles: filters[2] || [],
			requestMethods: filters[7] || [],
			modules: modules || [],
			childModules: filters[4] || [],
			beginTimeNormalOrder: beginTimeNormalOrderTemp,
			executeTimeNormalOrder: executeTimeNormalOrderTemp,
			statusOrder: statusOrderTemp
		};
		setCurrent(pagination.current || 1);
		setRoles(filters[2] || []);
		setPageSize(pagination.pageSize);
		setModules([]);
		setChildModules(filters[4] || []);
		getAuditLists(sendData);
	};

	return (
		<ProPage>
			<ProHeader title="操作审计" />
			<ProContent>
				<ProTable
					dataSource={dataSource}
					rowKey="id"
					scroll={{ x: 1300 }}
					pagination={{
						total: total,
						current: current,
						pageSize: pageSize
					}}
					showRefresh
					onRefresh={onRefresh}
					search={{
						onSearch: handleSearch,
						placeholder: '请输入登录账户/用户名/登录IP/路径搜索',
						style: { width: '360px' }
					}}
					onChange={handleTableChange}
				>
					<ProTable.Column
						title="登录账户"
						dataIndex="account"
						fixed="left"
						width={120}
					/>
					<ProTable.Column
						title="用户名"
						dataIndex="userName"
						fixed="left"
						width={100}
					/>
					<ProTable.Column
						title="角色"
						dataIndex="roleName"
						filters={roleFilters}
						filterMultiple={false}
						fixed="left"
						width={100}
					/>
					<ProTable.Column
						title="登录IP"
						dataIndex="remoteIp"
						width={120}
					/>
					<ProTable.Column
						title="版块"
						dataIndex="plate"
						filters={modulesFilters}
						filterMode="menu"
						width={200}
						render={plateRender}
					/>
					<ProTable.Column
						title="行为"
						dataIndex="actionChDesc"
						width={180}
					/>
					<ProTable.Column
						render={defaultValueRender}
						title="路径"
						dataIndex="url"
						width={300}
					/>
					<ProTable.Column
						title="方法"
						dataIndex="requestMethod"
						filters={methodsFilters}
						filterMultiple={true}
						width={100}
					/>
					<ProTable.Column
						title="耗时（ms）"
						dataIndex="executeTime"
						width={150}
						sorter={true}
					/>
					<ProTable.Column
						title="状态码"
						dataIndex="status"
						width={100}
						sorter={true}
					/>
					<ProTable.Column
						title="操作时间"
						dataIndex="beginTime"
						width={200}
						render={beginTimeRender}
						sorter={true}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						width={100}
						render={actionRender}
					/>
				</ProTable>
			</ProContent>
		</ProPage>
	);
}
