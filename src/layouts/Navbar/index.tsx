import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { Nav, Select, Message } from '@alicloud/console-components';

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
import { getUserInformation } from '@/services/user';
import messageConfig from '@/components/messageConfig';
import { disabledRoute, hideRoute, projectHideRoute } from '@/utils/const';
import { StoreState } from '@/types/index';
import { NavbarProps } from './navbar';

import styles from './navbar.module.scss';
import './navbar.scss';

function Navbar(props: NavbarProps): JSX.Element {
	const {
		user,
		style,
		setCluster,
		setNamespace,
		setProject,
		setRefreshCluster,
		setGlobalClusterList,
		setGlobalNamespaceList,
		getClusterId
	} = props;
	const { flag } = props.globalVar;
	const location = useLocation();
	const history = useHistory();
	const [currentCluster, setCurrentCluster] = useState<{ id?: string }>({});
	const [currentNamespace, setCurrentNamespace] = useState<{ name?: string }>(
		{}
	);
	const [currentProject, setCurrentProject] = useState<{
		projectId?: string;
	}>({});
	const [clusterList, setClusterList] = useState<any[]>([]);
	const [namespaceList, setNamespaceList] = useState<any[]>([]);
	const [projectList, setProjectList] = useState<any[]>([]);
	// * 控制项目
	const [projectDisAbled, setProjectDisabled] = useState<boolean>(false);
	const [projectHideFlag, setProjectHideFlag] = useState<boolean>(false);
	// 控制集群和分区
	const [disabled, setDisabled] = useState(false);
	const [hideFlag, setHideFlag] = useState(false);
	// * 用户信息
	const [nickName, setNickName] = useState('admin');
	const [role, setRole] = useState({ aliasName: '系统管理员' });
	// 设置logo
	const personalization = storage.getLocal('personalization');
	const footer = (nickName: string, role: { aliasName: string }) => (
		<div className={styles['action-bar']}>
			<div className={styles['action-bar-item']}>
				<User
					className={styles['module']}
					nickName={nickName}
					role={role}
				/>
			</div>
		</div>
	);

	const getUserInfo = async () => {
		const res: { aliasName?: string; [propsName: string]: any } =
			await getUserInformation();
		if (res.success) {
			setNickName(res.data.aliasName);
			setRole(res.data);
		} else {
			Message.show(messageConfig('error', '失败', res));
		}
	};

	const getProjectList = async () => {
		const res = await getProjects();
		if (res.success) {
			if (res.data.length > 0) {
				const jsonLocalProject = storage.getLocal('project');
				if (
					jsonLocalProject &&
					res.data.some(
						(item: any) =>
							item.projectId ===
							JSON.parse(jsonLocalProject).projectId
					)
				) {
					const localProjectTemp = res.data.find(
						(item: any) =>
							item.projectId ===
							JSON.parse(jsonLocalProject).projectId
					);
					setCurrentProject(localProjectTemp);
					setProject(localProjectTemp);
				} else {
					setCurrentProject(res.data[0].projectId);
					setProject(res.data[0]);
				}
			}
			setProjectList(res.data);
		}
	};

	const getClusterList = async () => {
		const res = await getClusters();
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
					getClusterId(localClusterTemp.id);
					setCurrentCluster(localClusterTemp);
					setCluster(localClusterTemp);
				} else {
					setCurrentCluster(res.data[0]);
					setCluster(res.data[0]);
					getClusterId(res.data[0].id);
					storage.setLocal('cluster', JSON.stringify(res.data[0]));
				}
			}
			setClusterList(res.data);
			setGlobalClusterList(res.data);
		}
	};

	const getNamespaceList = async (clusterId: string | undefined) => {
		const res = await getNamespaces({ clusterId, withQuota: true });
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

	const clusterHandle = (id: number) => {
		for (let i = 0; i < clusterList.length; i++) {
			if (clusterList[i].id === id) {
				setCurrentCluster(clusterList[i]);
				setCluster(clusterList[i]);
				getClusterId(clusterList[i].id);
				storage.setLocal('cluster', JSON.stringify(clusterList[i]));
			}
		}
	};

	const namespaceHandle = (name: string) => {
		for (let i = 0; i < namespaceList.length; i++) {
			if (namespaceList[i].name === name) {
				setCurrentNamespace(namespaceList[i]);
				setNamespace(namespaceList[i]);
				storage.setLocal('namespace', JSON.stringify(namespaceList[i]));
			}
		}
	};
	const projectHandle = (projectId: string) => {
		for (let i = 0; i < projectList.length; i++) {
			if (projectList[i].projectId === projectId) {
				setCurrentProject(projectList[i]);
				setProject(projectList[i]);
				storage.setLocal('project', JSON.stringify(projectList[i]));
			}
		}
	};

	useEffect(() => {
		getClusterList();
		getProjectList();
		getUserInfo();
	}, []);

	useEffect(() => {
		if (flag) {
			getClusterList();
			getProjectList();
			setRefreshCluster(false);
		}
	}, [flag]);

	useEffect(() => {
		if (JSON.stringify(currentCluster) !== '{}')
			getNamespaceList(currentCluster.id);
	}, [currentCluster]);

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
			} else setDisabled(false);
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

	useEffect(() => {
		/**TODO 用户权限 */
	}, [user]);

	return (
		<div className={styles['middleware-navbar']} style={{ ...style }}>
			<Nav
				className={styles['custom-nav']}
				direction="hoz"
				type="normal"
				header={
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
				}
				footer={footer(nickName, role)}
				embeddable={true}
				style={{
					lineHeight: '48px',
					zIndex: 999
				}}
			>
				{projectHideFlag === false && (
					<>
						<span style={{ marginRight: 8 }}>项目</span>
						<Select
							className="no-shadow"
							hasBorder={false}
							disabled={projectDisAbled}
							autoWidth={false}
							value={currentProject.projectId}
							onChange={projectHandle}
						>
							{projectList.map((project, index) => {
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
							value={currentCluster.id}
							hasBorder={false}
							disabled={disabled}
							onChange={clusterHandle}
							autoWidth={false}
						>
							{clusterList.map((cluster, index) => {
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
							value={currentNamespace.name}
							hasBorder={false}
							disabled={disabled}
							onChange={namespaceHandle}
							autoWidth={false}
						>
							{namespaceList.map((namespace, index) => {
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
			</Nav>
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
	setGlobalNamespaceList
})(Navbar);
