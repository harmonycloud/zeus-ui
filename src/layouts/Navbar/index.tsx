import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { Divider, Input, Select, Tooltip } from 'antd';
import { IconFont } from '@/components/IconFont';
import User from './User';
import {
	setCluster,
	setNamespace,
	setProject,
	setRefreshCluster,
	setGlobalClusterList,
	setGlobalNamespaceList
} from '@/redux/globalVar/var';
import { disabledRoute, hideRoute, projectHideRoute } from '@/utils/const';
import Storage from '@/utils/storage';
import { StoreState } from '@/types/index';
import { NavbarProps } from './navbar';
import styles from './navbar.module.scss';
import { getIsAccessGYT } from '@/services/common';
import './navbar.scss';

const { Search } = Input;
function Navbar(props: NavbarProps): JSX.Element {
	const {
		style,
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
	const location = useLocation();
	const history = useHistory();
	// * 控制项目
	const [projectDisAbled, setProjectDisabled] = useState<boolean>(false);
	const [projectHideFlag, setProjectHideFlag] = useState<boolean>(false);
	// 控制集群和分区
	const [disabled, setDisabled] = useState(false);
	const [hideFlag, setHideFlag] = useState(false);
	// 设置logo
	const personalization = storage.getLocal('personalization');
	// * 搜索项目
	const [proSearch, setProSearch] = useState<string>('');
	const [isAccess, setIsAccess] = useState<boolean>(false);
	const clusterChange = (id: string) => {
		clusterHandle(id);
	};

	const namespaceChange = (name: string) => {
		namespaceHandle(name);
	};
	const projectChange = (id: string) => {
		projectHandle(id);
	};

	useEffect(() => {
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);

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
								optionLabelProp="label"
								onChange={projectChange}
								dropdownRender={(menu) => {
									if (projects.length > 10) {
										return (
											<>
												<Search
													style={{
														width: '100%',
														padding: '4px 8px 8px'
													}}
													placeholder="请输入项目名称搜索"
													onChange={(
														event: React.ChangeEvent<HTMLInputElement>
													) => {
														setProSearch(
															event.target.value
														);
													}}
													value={proSearch}
												/>
												<Divider
													style={{
														margin: '0 0 8px 0 '
													}}
												/>
												{isAccess && (
													<>
														<div
															className="flex-space-between"
															style={{
																padding:
																	'5px 12px',
																background:
																	'#f8f8f8'
															}}
														>
															<div>项目</div>
															<div>租户</div>
														</div>
														<Divider
															style={{
																margin: '0 0 8px 0 '
															}}
														/>
													</>
												)}
												{menu}
											</>
										);
									} else {
										return (
											<>
												{isAccess && (
													<>
														<div
															className="flex-space-between"
															style={{
																padding:
																	'5px 12px',
																background:
																	'#f8f8f8'
															}}
														>
															<div>项目</div>
															<div>租户</div>
														</div>
														<Divider
															style={{
																margin: '0 0 8px 0 '
															}}
														/>
													</>
												)}
												{menu}
											</>
										);
									}
								}}
							>
								{projects
									.filter((item) =>
										item.aliasName.includes(proSearch)
									)
									.map((project, index) => {
										return (
											<Select.Option
												key={index}
												value={project.projectId}
												style={{
													justifyContent:
														'space-between'
												}}
												label={project.aliasName}
											>
												<div className="flex-space-between">
													<div>
														{project.aliasName}
													</div>
													{isAccess && (
														<div
															style={{
																marginLeft: 40
															}}
														>
															{
																project.tenantAliasName
															}
														</div>
													)}
												</div>
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
								style={{ marginLeft: 8, maxWidth: '300px' }}
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
											{namespace.availableDomain ? (
												<p className="display-flex flex-align">
													<span
														className="text-overflow-one"
														style={{
															display:
																'inline-block',
															maxWidth: '210px',
															maxHeight: '30px'
														}}
														title={
															namespace.aliasName
														}
													>
														{namespace.aliasName}
													</span>
													<span className="available-domain">
														可用区
													</span>
												</p>
											) : (
												namespace.aliasName
											)}
										</Select.Option>
									);
								})}
							</Select>
						</>
					)}
				</div>
				{Storage.getLocal('userName') === 'admin' && (
					<Tooltip title="授权管理">
						<div
							className="license-icon"
							onClick={() => history.push('/authorManage')}
						>
							<IconFont
								type="icon-shouquan"
								style={{ fontSize: 20, color: 'rgb(29,29,29)' }}
							/>
						</div>
					</Tooltip>
				)}
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
	setGlobalNamespaceList
})(Navbar);
