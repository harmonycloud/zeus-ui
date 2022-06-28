import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MyMenu from './Menu/MyMenu';
import Routes from './routes';
import { connect } from 'react-redux';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { MenuProps, notification } from 'antd';
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
import { clusterType, globalVarProps, StoreState, User } from '@/types';
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
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';

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
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]); // * 分区列表
	const [currentNamespace, setCurrentNamespace] = useState<NamespaceItem>(); // * 当前命名分区 name
	// * 用户信息
	const [nickName, setNickName] = useState<string>('');
	const [role, setRole] = useState<User>();

	useEffect(() => {
		if (
			storage.getLocal('token') &&
			!window.location.href.includes('terminal')
		) {
			getUserInfo().then(() => {
				getMenus();
				getProjectList();
			});
		}
	}, []);
	useEffect(() => {
		if (currentCluster && currentProject) {
			getMenuMid(currentProject, currentCluster);
			getNamespaceList(currentProject.projectId, currentCluster.id);
		}
	}, [currentCluster]);
	useEffect(() => {
		if (flag) {
			getProjectList();
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
		} else {
			notification.error({
				message: '失败',
				description: res.errorMsg
			});
		}
	};

	const getProjectList = async () => {
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
					setCurrentProject(res.data[0]);
					setProject(res.data[0]); // * 将当前的项目详情设置到redux中
					storage.setLocal('project', JSON.stringify(res.data[0]));
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
				} else {
					setCurrentCluster(res.data[0]);
					setCluster(res.data[0]); // * 将当前集群信息设置到redux中
					storage.setLocal('cluster', JSON.stringify(res.data[0]));
				}
			} else {
				setCurrentCluster(undefined);
				setCluster({}); // * 将当前集群信息设置到redux中
				storage.setLocal('cluster', '{}');
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
			console.log(list);
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

	const getMenus = async () => {
		const res = await getMenu();
		if (res.success) {
			const its = res.data.map((item: ResMenuItem) => {
				if (item.subMenu) {
					const childMenu = item.subMenu.map((item: ResMenuItem) =>
						getItem(item.aliasName, item.url)
					);
					if (item.name === 'backupService') {
						return getItem(
							item.aliasName,
							item.url,
							<img width={12} height={12} src={backupService} />,
							childMenu
						);
					}
					return getItem(
						item.aliasName,
						item.url,
						<IconFont size={14} type={item.iconName} />,
						childMenu
					);
				} else {
					if (item.name === 'storageManagement') {
						return getItem(
							item.aliasName,
							item.url,
							<StorageManageIcon />
						);
					}
					if (item.name === 'myProject') {
						return getItem(
							item.aliasName,
							item.url,
							<img width={12} height={12} src={myProject} />
						);
					}
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
	const getMenuMid = async (
		currentProject: ProjectItem,
		currentCluster: clusterType
	) => {
		const res = await getServiceListChildMenu({
			projectId: currentProject.projectId,
			clusterId: currentCluster.id
		});
		if (res.success) {
			const child = res.data.map((i: ResMenuItem) =>
				getItem(i.aliasName, i.url)
			);
			const itemsT = items.map((item: any) => {
				if (item?.key === 'serviceList') {
					item.children = child;
				}
				return item;
			});
			setItems(itemsT);
		}
	};
	// * 命名分区切换
	const namespaceHandle = (value: string) => {
		const curns = namespaceList.find(
			(i: NamespaceItem) => i.name === value
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
	};
	// * 项目切换
	const projectHandle = (value: string) => {
		const curpj = projectList.find(
			(i: ProjectItem) => i.projectId === value
		);
		setCurrentProject(curpj);
		setProject(curpj);
		storage.setLocal('project', JSON.stringify(curpj));
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
						<div className="zeus-mid-title">中间件平台</div>
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
