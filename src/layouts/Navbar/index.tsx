import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { Select, notification } from 'antd';

import User from './User';

import { getClusters, getNamespaces } from '@/services/common';
import { getProjects } from '@/services/project';
import {
	setCluster,
	setNamespace,
	setProject,
	setRefreshCluster,
	setGlobalClusterList,
	setGlobalNamespaceList
} from '@/redux/globalVar/var';
import { setMenuRefresh } from '@/redux/menu/menu';
import { getUserInformation } from '@/services/user';
import { disabledRoute, hideRoute, projectHideRoute } from '@/utils/const';
import { StoreState } from '@/types/index';
import { NavbarProps } from './navbar';

import styles from './navbar.module.scss';
import './navbar.scss';

function Navbar(props: NavbarProps): JSX.Element {
	const {
		// user,
		style,
		setCluster,
		setNamespace,
		setProject,
		setRefreshCluster,
		setGlobalClusterList,
		setGlobalNamespaceList,
		// getClusterId,
		setMenuRefresh,
		currentProject,
		projects,
		currentCluster,
		clusters,
		namespaces,
		currentNamespace,
		user,
		nickName,
		namespaceHandle,
		clusterHandle,
		projectHandle
	} = props;
	const { flag, namespace } = props.globalVar;
	const location = useLocation();
	// const [currentCluster, setCurrentCluster] = useState<{
	// 	id?: number | null;
	// }>({});
	// const [currentNamespace, setCurrentNamespace] = useState<{ name?: string }>(
	// 	{}
	// );
	// const [currentProject, setCurrentProject] = useState<{
	// 	projectId?: string;
	// }>({});
	// const [clusterList, setClusterList] = useState<any[]>([]);
	// const [namespaceList, setNamespaceList] = useState<any[]>([]);
	// const [projectList, setProjectList] = useState<any[]>([]);
	// * 控制项目
	const [projectDisAbled, setProjectDisabled] = useState<boolean>(false);
	const [projectHideFlag, setProjectHideFlag] = useState<boolean>(false);
	// 控制集群和分区
	const [disabled, setDisabled] = useState(false);
	const [hideFlag, setHideFlag] = useState(false);
	// * 用户信息
	// const [nickName, setNickName] = useState('admin');
	// const [role, setRole] = useState({ aliasName: '系统管理员' });
	// 设置logo
	const personalization = storage.getLocal('personalization');

	// const getUserInfo = async () => {
	// 	const res: { aliasName?: string; [propsName: string]: any } =
	// 		await getUserInformation();
	// 	if (res.success) {
	// 		setNickName(res.data.aliasName);
	// 		setRole(res.data);
	// 		storage.setLocal('role', JSON.stringify(res.data));
	// 	} else {
	// 		notification.error({
	// 			message: '失败',
	// 			description: res.errorMsg
	// 		});
	// 	}
	// };

	// const getProjectList = async () => {
	// 	const res = await getProjects({ key: '' });
	// 	if (res.success) {
	// 		if (res.data.length > 0) {
	// 			const jsonLocalProject = storage.getLocal('project');
	// 			if (
	// 				jsonLocalProject !== '' &&
	// 				res.data.some(
	// 					(item: any) =>
	// 						item.projectId ===
	// 						JSON.parse(jsonLocalProject).projectId
	// 				)
	// 			) {
	// 				const localProjectTemp = res.data.find(
	// 					(item: any) =>
	// 						item.projectId ===
	// 						JSON.parse(jsonLocalProject).projectId
	// 				);
	// 				setCurrentProject(localProjectTemp);
	// 				setProject(localProjectTemp);
	// 			} else {
	// 				setCurrentProject(res.data[0]);
	// 				setProject(res.data[0]);
	// 				storage.setLocal('project', JSON.stringify(res.data[0]));
	// 			}
	// 		} else {
	// 			// getClusterList('');
	// 			setCurrentProject({});
	// 			setProject({});
	// 			storage.setLocal('project', '{}');
	// 		}
	// 		setProjectList(res.data);
	// 	}
	// };

	// const getClusterList = async (projectId: string | undefined) => {
	// 	const res = await getClusters({ projectId });
	// 	if (res.success) {
	// 		if (res.data.length > 0) {
	// 			const jsonLocalCluster = storage.getLocal('cluster');
	// 			if (
	// 				jsonLocalCluster &&
	// 				res.data.some((item: any) => {
	// 					return item.id === JSON.parse(jsonLocalCluster).id;
	// 				})
	// 			) {
	// 				const localClusterTemp = res.data.find(
	// 					(item: any) =>
	// 						item.id === JSON.parse(jsonLocalCluster).id
	// 				);
	// 				getClusterId(localClusterTemp.id);
	// 				setCurrentCluster(localClusterTemp);
	// 				setCluster(localClusterTemp);
	// 			} else {
	// 				setCurrentCluster(res.data[0]);
	// 				setCluster(res.data[0]);
	// 				getClusterId(res.data[0].id);
	// 				storage.setLocal('cluster', JSON.stringify(res.data[0]));
	// 			}
	// 		} else {
	// 			setCurrentCluster({ id: 0 });
	// 			setCluster({});
	// 			getClusterId();
	// 			storage.setLocal('cluster', '{}');
	// 		}
	// 		setClusterList(res.data);
	// 		setGlobalClusterList(res.data);
	// 	}
	// };

	// const getNamespaceList = async (
	// 	clusterId: number | undefined | null,
	// 	projectId: string | undefined
	// ) => {
	// 	const res = await getNamespaces({
	// 		clusterId,
	// 		projectId,
	// 		withQuota: true
	// 	});
	// 	if (res.success) {
	// 		const list = [{ name: '*', aliasName: '全部' }, ...res.data];
	// 		const jsonLocalNamespace = storage.getLocal('namespace');
	// 		if (
	// 			jsonLocalNamespace &&
	// 			list.some((item: any) => {
	// 				return item.name === JSON.parse(jsonLocalNamespace).name;
	// 			})
	// 		) {
	// 			setCurrentNamespace(JSON.parse(jsonLocalNamespace));
	// 			setNamespace(JSON.parse(jsonLocalNamespace));
	// 		} else {
	// 			setCurrentNamespace(list[0]);
	// 			setNamespace(list[0]);
	// 			storage.setLocal('namespace', JSON.stringify(list[0]));
	// 		}
	// 		setNamespaceList(list);
	// 		setGlobalNamespaceList(list);
	// 	}
	// };

	const clusterChange = (id: string) => {
		clusterHandle(id);
		// for (let i = 0; i < clusterList.length; i++) {
		// 	if (clusterList[i].id === id) {
		// 		setCurrentCluster(clusterList[i]);
		// 		setCluster(clusterList[i]);
		// 		// getClusterId(clusterList[i].id);
		// 		storage.setLocal('cluster', JSON.stringify(clusterList[i]));
		// 	}
		// }
	};

	const namespaceChange = (name: string) => {
		namespaceHandle(name);
		// for (let i = 0; i < namespaceList.length; i++) {
		// 	if (namespaceList[i].name === name) {
		// 		setCurrentNamespace(namespaceList[i]);
		// 		setNamespace(namespaceList[i]);
		// 		storage.setLocal('namespace', JSON.stringify(namespaceList[i]));
		// 	}
		// }
	};
	const projectChange = (id: string) => {
		projectHandle(id);
		// for (let i = 0; i < projectList.length; i++) {
		// 	if (projectList[i].projectId === projectId) {
		// 		// setCurrentProject(projectList[i]);
		// 		setProject(projectList[i]);
		// 		setMenuRefresh(true);
		// 		storage.setLocal('project', JSON.stringify(projectList[i]));
		// 	}
		// }
	};

	// useEffect(() => {
	// 	// getUserInfo().then(() => {
	// 		// getProjectList().then(() => {
	// 		// 	const jsonProject = storage.getLocal('project');
	// 		// 	if (jsonProject === '' || jsonProject === undefined) {
	// 		// 		const jsonRole = JSON.parse(storage.getLocal('role'));
	// 		// 		if (jsonRole.userRoleList[0].roleId === 1) {
	// 		// 			getClusterList('');
	// 		// 		}
	// 		// 	}
	// 		// });
	// 	// });
	// }, []);

	// useEffect(() => {
	// 	if (flag) {
	// 		// getProjectList();
	// 		setRefreshCluster(false);
	// 	}
	// }, [flag]);

	// useEffect(() => {
	// 	if (JSON.stringify(currentProject) !== '{}') {
	// 		// getClusterList(currentProject?.projectId);
	// 	}
	// }, [currentProject]);

	// useEffect(() => {
	// 	if (
	// 		JSON.stringify(currentCluster) !== '{}' &&
	// 		JSON.stringify(currentProject) !== '{}'
	// 	)
	// 		getNamespaceList(currentCluster.id, currentProject.projectId);
	// }, [currentCluster]);

	useEffect(() => {
		if (location && location.pathname) {
			// 是否可选择
			if (
				disabledRoute.some((item) => {
					return location.pathname.indexOf(item) > -1;
				})
			) {
				setDisabled(true);
				setProjectDisabled(true);
			} else {
				setDisabled(false);
				setProjectDisabled(false);
			}
			// 是否显示 - 集群/分区
			if (
				hideRoute.some((item) => {
					return location.pathname.indexOf(item) > -1;
				})
			) {
				setHideFlag(true);
			} else {
				setHideFlag(false);
			}
			// * 是否显示 - 项目
			if (
				projectHideRoute.some(
					(item: string) => location.pathname.indexOf(item) > -1
				)
			) {
				setProjectHideFlag(true);
			} else {
				setProjectHideFlag(false);
			}
		}
	}, [location]);

	// useEffect(() => {
	// 	setCurrentNamespace(namespace);
	// }, [namespace]);

	return (
		<div className={styles['middleware-navbar']} style={{ ...style }}>
			<nav className={styles['nav']}>
				<div
					className={styles['logo-box']}
					style={{
						lineHeight: '48px',
						textAlign: 'center',
						padding: '5px 0px'
					}}
				>
					<img
						className={styles['logo-png']}
						src={personalization && personalization.homeLogo}
						alt=""
					/>
				</div>
				<div className={styles['nav-content']}>
					{projectHideFlag === false && (
						<>
							<span style={{ marginRight: 8 }}>项目</span>
							<Select
								className="no-shadow"
								bordered={false}
								disabled={projectDisAbled}
								dropdownMatchSelectWidth={false}
								value={
									currentProject
										? currentProject.projectId
										: '当前平台无项目'
								}
								onChange={projectChange}
							>
								{projects.map((project, index) => {
									return (
										<Select.Option
											key={index}
											value={project.projectId}
										>
											{project.aliasName}
										</Select.Option>
									);
								})}
							</Select>
						</>
					)}
					{hideFlag === false && (
						<>
							<span style={{ marginLeft: 24 }}>集群</span>
							<Select
								style={{ marginLeft: 8 }}
								className="no-shadow"
								value={
									currentCluster
										? currentCluster.id
										: '当前项目没有绑定集群'
								}
								bordered={false}
								disabled={disabled}
								onChange={clusterChange}
								dropdownMatchSelectWidth={false}
							>
								{clusters.map((cluster, index) => {
									return (
										<Select.Option
											key={index}
											value={cluster.id}
										>
											{cluster.nickname}
										</Select.Option>
									);
								})}
							</Select>
							<span style={{ marginLeft: 24 }}>命名空间</span>
							<Select
								style={{ marginLeft: 8 }}
								className="no-shadow"
								value={
									currentNamespace
										? currentNamespace.name
										: '当前集群没有注册分区'
								}
								bordered={false}
								disabled={disabled}
								onChange={namespaceChange}
								dropdownMatchSelectWidth={false}
							>
								{namespaces.map((namespace, index) => {
									return (
										<Select.Option
											key={index}
											value={namespace.name}
										>
											{namespace.aliasName}
										</Select.Option>
									);
								})}
							</Select>
						</>
					)}
				</div>
				<User
					className={styles['module']}
					nickName={nickName}
					role={user}
				/>
			</nav>
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
})(Navbar);
