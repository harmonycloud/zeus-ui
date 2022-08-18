import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Routes from './routes';
import { connect } from 'react-redux';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { MenuProps, notification } from 'antd';
import Navbar from './Navbar';
import MyMenu from './Menu/MyMenu';
import Login from '@/pages/Login';
import MidTerminal from '@/components/MidTerminal';
import storage from '@/utils/storage';
import './layout.scss';
import { getMenu, getServiceListChildMenu } from '@/services/user';
import { IconFont, StorageManageIcon } from '@/components/IconFont';
import { ResMenuItem } from '@/types/comment';
import { getProjects } from '@/services/project';
import { getClusters, getNamespaces } from '@/services/common';
import { ProjectItem } from '@/pages/ProjectManage/project';
import { getUserInformation } from '@/services/user';
import {
	clusterType,
	globalVarProps,
	NavbarNamespaceItem,
	StoreState,
	User
} from '@/types';
import {
	setCluster,
	setNamespace,
	setProject,
	setRefreshCluster,
	setGlobalClusterList,
	setGlobalNamespaceList
} from '@/redux/globalVar/var';
import { setMenuRefresh } from '@/redux/menu/menu';
import backupService from '@/assets/images/backupService.svg';
import myProject from '@/assets/images/myProject.svg';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[]
): MenuItem {
	return {
		key,
		icon,
		children,
		label
	} as MenuItem;
}
interface MyLayoutProps {
	globalVar: globalVarProps;
	setCluster: (cluster: any) => void;
	setNamespace: (namespace: any) => void;
	setProject: (project: any) => void;
	setRefreshCluster: (flag: boolean) => void;
	setGlobalClusterList: (clusterList: any) => void;
	setGlobalNamespaceList: (namespaceList: any) => void;
	setMenuRefresh: (flag: boolean) => void;
}
function MyLayout(props: MyLayoutProps): JSX.Element {
	const {
		setCluster,
		setNamespace,
		setProject,
		setRefreshCluster,
		setGlobalClusterList,
		setGlobalNamespaceList,
		setMenuRefresh
	} = props;
	const { flag } = props.globalVar;
	const [collapsed, setCollapsed] = useState<boolean>(false); // * 是否收起侧边栏
	const [items, setItems] = useState<MenuItem[]>([]); // * 菜单
	const [projectList, setProjectList] = useState<ProjectItem[]>([]); // * 项目列表
	const [currentProject, setCurrentProject] = useState<ProjectItem>(); // * 当前项目的信息
	const [clusterList, setClusterList] = useState<clusterType[]>([]); // * 集群列表
	const [currentCluster, setCurrentCluster] = useState<clusterType>(); // * 当前集群的id
	const [namespaceList, setNamespaceList] = useState<NavbarNamespaceItem[]>(
		[]
	); // * 分区列表
	const [currentNamespace, setCurrentNamespace] =
		useState<NavbarNamespaceItem>(); // * 当前命名分区 name
	// * 用户信息
	const [nickName, setNickName] = useState<string>('');
	const [role, setRole] = useState<User>();
	useEffect(() => {
		if (
			storage.getLocal('token') &&
			!window.location.href.includes('terminal')
		) {
			getUserInfo().then((res) => {
				const proId = res.userRoleList[0].projectId;
				const jsonLocalProject = storage.getLocal('project');
				const sendProId =
					jsonLocalProject !== ''
						? JSON.parse(jsonLocalProject).projectId
						: proId;
				getMenus(sendProId).then(() => {
					getProjectList(res);
				});
			});
		}
	}, []);
	useEffect(() => {
		if (currentProject) {
			getMenus(currentProject.projectId);
		}
	}, [currentProject]);
	useEffect(() => {
		if (currentProject && currentCluster) {
			getMenuMid(currentProject.projectId, currentCluster.id);
		} else if (currentProject) {
			getMenuMid(currentProject.projectId);
		}
	}, [currentCluster]);
	useEffect(() => {
		if (flag && role) {
			getProjectList(role);
			setRefreshCluster(false);
		}
	}, [flag]);
	const getUserInfo = async () => {
		const res: { aliasName?: string; [propsName: string]: any } =
			await getUserInformation();
		if (res.success) {
			setNickName(res.data.aliasName);
			setRole(res.data);
			storage.setLocal('role', JSON.stringify(res.data));
			return res.data;
		} else {
			notification.error({
				message: '失败',
				description: res.errorMsg
			});
			return null;
		}
	};

	const getProjectList = async (role: User) => {
		const res = await getProjects({ key: '' });
		if (res.success) {
			if (res.data.length > 0) {
				const jsonLocalProject = storage.getLocal('project');
				if (
					jsonLocalProject !== '' &&
					res.data.some(
						(item: any) =>
							item.projectId ===
							JSON.parse(jsonLocalProject).projectId
					)
				) {
					const localProjectTemp: ProjectItem = res.data.find(
						(item: any) =>
							item.projectId ===
							JSON.parse(jsonLocalProject).projectId
					);
					setCurrentProject(localProjectTemp);
					getClusterList(localProjectTemp.projectId);
					setProject(localProjectTemp); // * 将当前的项目详情设置到redux中
				} else {
					if (role.isAdmin) {
						// * 当用户为管理员时，当前项目默认选取项目列表第一个
						setCurrentProject(res.data[0]);
						setProject(res.data[0]); // * 将当前的项目详情设置到redux中
						getClusterList(res.data[0].projectId);
						storage.setLocal(
							'project',
							JSON.stringify(res.data[0])
						);
					} else {
						// * 当用户为非管理员时，当前项目默认选择 用户信息中权限列表的第一项
						const cup = res.data.find(
							(item: any) =>
								item.projectId ===
								role.userRoleList[0].projectId
						);
						setCurrentProject(cup);
						setProject(cup); // * 将当前的项目详情设置到redux中
						getClusterList(cup.projectId);
						storage.setLocal('project', JSON.stringify(cup));
					}
				}
			} else {
				setCurrentProject(undefined);
				setProject({}); // * 将当前的项目详情设置到redux中
				storage.setLocal('project', '{}');
			}
			setProjectList(res.data);
		}
	};
	const getClusterList = async (projectId: string) => {
		const res = await getClusters({ projectId });
		if (res.success) {
			if (res.data.length > 0) {
				const jsonLocalCluster = storage.getLocal('cluster');
				if (
					jsonLocalCluster &&
					res.data.some((item: any) => {
						return item.id === JSON.parse(jsonLocalCluster).id;
					})
				) {
					const localClusterTemp = res.data.find(
						(item: any) =>
							item.id === JSON.parse(jsonLocalCluster).id
					);
					setCurrentCluster(localClusterTemp);
					setCluster(localClusterTemp); // * 将当前集群信息设置到redux中
					getNamespaceList(projectId, localClusterTemp.id);
				} else {
					setCurrentCluster(res.data[0]);
					setCluster(res.data[0]); // * 将当前集群信息设置到redux中
					storage.setLocal('cluster', JSON.stringify(res.data[0]));
					getNamespaceList(projectId, res.data[0].id);
				}
			} else {
				setCurrentCluster(undefined);
				setCluster({}); // * 将当前集群信息设置到redux中
				storage.setLocal('cluster', '{}');
				setCurrentNamespace(undefined);
				setNamespace({ name: '*', aliasName: '全部' });
				setNamespaceList([{ name: '*', aliasName: '全部' }]);
			}
			setClusterList(res.data);
			setGlobalClusterList(res.data); // * 将当前集群列表信息设置到redux中
		}
	};
	const getNamespaceList = async (projectId: string, clusterId: string) => {
		const res = await getNamespaces({
			clusterId,
			projectId,
			withQuota: true
		});
		if (res.success) {
			const list = [{ name: '*', aliasName: '全部' }, ...res.data];
			const jsonLocalNamespace = storage.getLocal('namespace');
			if (
				jsonLocalNamespace &&
				list.some((item: any) => {
					return item.name === JSON.parse(jsonLocalNamespace).name;
				})
			) {
				setCurrentNamespace(JSON.parse(jsonLocalNamespace));
				setNamespace(JSON.parse(jsonLocalNamespace));
			} else {
				setCurrentNamespace(list[0]);
				setNamespace(list[0]);
				storage.setLocal('namespace', JSON.stringify(list[0]));
			}
			setNamespaceList(list);
			setGlobalNamespaceList(list);
		}
	};

	const getMenus = async (projectId: string) => {
		const res = await getMenu({ projectId });
		if (res.success) {
			const its = res.data.map((item: ResMenuItem) => {
				if (item.subMenu) {
					const childMenu = item.subMenu.map((item: ResMenuItem) =>
						getItem(item.aliasName, item.url)
					);
					return getItem(
						item.aliasName,
						item.url,
						<IconFont size={14} type={item.iconName} />,
						childMenu
					);
				} else {
					return getItem(
						item.aliasName,
						item.url,
						<IconFont size={14} type={item.iconName} />
					);
				}
			});
			setItems(its);
		}
	};
	const getMenuMid = async (projectId?: string, clusterId?: string) => {
		if (clusterId && projectId) {
			const res = await getServiceListChildMenu({
				projectId: projectId,
				clusterId: clusterId
			});
			if (res.success) {
				const child = res.data.map((i: ResMenuItem) =>
					getItem(i.aliasName, i.url || '')
				);
				const itemsT = items.map((item: any) => {
					if (item?.key === 'serviceList') {
						item.children = child.length > 0 ? child : null;
					}
					return item;
				});
				setItems(itemsT);
				console.log(storage.getSession('menuPath'));
				console.log(child);
				if (child.length > 0) {
					if (window.location.hash === '#/serviceList') {
						window.location.href =
							window.location.origin + '/#/' + res.data[0].url;
						storage.setSession('menuPath', res.data[0].url);
					} else {
						if (
							child.every(
								(item: any) =>
									item.key !== storage.getSession('menuPath')
							)
						) {
							window.location.href =
								window.location.origin +
								'/#/' +
								res.data[0].url;
							storage.setSession('menuPath', res.data[0].url);
						}
					}
				}
			}
		} else {
			const itemT = items.map((item: any) => {
				if (item.key === 'serviceList') {
					item.children = null;
				}
				return item;
			});
			setItems(itemT);
		}
	};
	// * 命名分区切换
	const namespaceHandle = (value: string) => {
		const curns = namespaceList.find(
			(i: NavbarNamespaceItem) => i.name === value
		);
		setCurrentNamespace(curns);
		setNamespace(curns);
		storage.setLocal('namespace', JSON.stringify(curns));
	};
	// * 集群切换
	const clusterHandle = (value: string) => {
		const curcl = clusterList.find((i: clusterType) => i.id === value);
		setCurrentCluster(curcl);
		setCluster(curcl);
		storage.setLocal('cluster', JSON.stringify(curcl));
		currentProject && getNamespaceList(currentProject?.projectId, value);
	};
	// * 项目切换
	const projectHandle = (value: string) => {
		const curpj = projectList.find(
			(i: ProjectItem) => i.projectId === value
		);
		setCurrentProject(curpj);
		setProject(curpj);
		storage.setLocal('project', JSON.stringify(curpj));
		getClusterList(value);
	};

	// * 跳转到登陆页
	const redirectToLogin = () => (
		<Router>
			<Route path={['/', '/login']} component={Login} />
		</Router>
	);
	// * 终端页面
	const redirectToTerminal = () => (
		<Router>
			<Route path="/terminal/:url" component={MidTerminal} exact />
		</Router>
	);
	// * 没有token时，跳转到登陆页
	if (!storage.getLocal('token')) {
		return redirectToLogin();
	}
	// * 当路由中包含terminal字段时，显示终端页面
	if (window.location.href.includes('terminal')) {
		return redirectToTerminal();
	}
	return (
		<div className="zeus-mid-layout">
			<Router>
				<Navbar
					currentProject={currentProject}
					projects={projectList}
					user={role}
					nickName={nickName}
					currentCluster={currentCluster}
					clusters={clusterList}
					namespaces={namespaceList}
					currentNamespace={currentNamespace}
					namespaceHandle={namespaceHandle}
					clusterHandle={clusterHandle}
					projectHandle={projectHandle}
				/>
				<div className="zeus-mid-content">
					<aside style={{ width: collapsed ? '0px' : '200px' }}>
						<div className="zeus-mid-title">
							谐云云原生中间件管理平台
						</div>
						<MyMenu items={items} />
					</aside>
					<div
						className="zeus-mid-left-content"
						style={{
							marginLeft: collapsed ? '0px' : '200px',
							minWidth: collapsed ? '100%' : 'calc(100% - 200px)'
						}}
					>
						<Routes />
					</div>
				</div>
				<div
					className="zeus-mid-flod-content"
					style={{
						left: collapsed ? '0px' : '200px'
					}}
					onClick={() => setCollapsed(!collapsed)}
				>
					{collapsed ? <RightOutlined /> : <LeftOutlined />}
				</div>
			</Router>
		</div>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setCluster,
	setNamespace,
	setProject,
	setRefreshCluster,
	setGlobalClusterList,
	setGlobalNamespaceList,
	setMenuRefresh
})(MyLayout);
