import React, { useState, useEffect } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import { notification } from 'antd';
import {
	getProjects,
	getProjectMiddleware,
	getProjectMiddlewareCount
} from '@/services/project';
import { setMenuRefresh } from '@/redux/menu/menu';
import { setProject, setRefreshCluster } from '@/redux/globalVar/var';
import EditProjectForm from './editProjectForm';
import storage from '@/utils/storage';
import { MiddlewareTableItem, MyProjectProps } from './myProject';
import { StoreState } from '@/types';
import { ProjectItem } from '../ProjectManage/project';
import { roleProps } from '../RoleManage/role';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';
import { nullRender } from '@/utils/utils';
import projectIcon from '@/assets/images/project.svg';
import './index.scss';

const LinkButton = Actions.LinkButton;
function MyProject(props: MyProjectProps): JSX.Element {
	const { setProject, setRefreshCluster, project, setMenuRefresh } = props;
	const history = useHistory();
	const [role, setRole] = useState<roleProps>();
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<ProjectItem[]>([]);
	const [currentProject, setCurrentProject] = useState<ProjectItem>(project);
	const [projectLoading, setProjectLoading] = useState<boolean>(false);
	const [middlewareLoading, setMiddlewareLoading] = useState<boolean>(false);
	const [tableDataSource, setTableDataSource] = useState<
		MiddlewareTableItem[]
	>([]);
	const [projectMiddlewareCount, setProjectMiddleware] = useState<
		ProjectItem[]
	>([]);
	useEffect(() => {
		if (storage.getLocal('role')) {
			setRole(JSON.parse(storage.getLocal('role')));
		}
	}, [storage.getLocal('role')]);
	useEffect(() => {
		if (role) {
			if (role.userRoleList.some((i: any) => i.roleId) === 1) {
				if (
					JSON.stringify(currentProject) !== '{}' &&
					currentProject !== undefined
				) {
					getData();
					getCount();
				}
			} else {
				getData();
				getCount();
			}
		}
	}, [role]);
	const getCount = () => {
		getProjectMiddlewareCount().then((res) => {
			if (res.success) {
				setProjectMiddleware(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const getData = () => {
		setProjectLoading(true);
		getProjects({ key: '' })
			.then((res) => {
				if (res.success) {
					setDataSource(res.data);
					if (!currentProject) setCurrentProject(res.data[0]);
					if (
						!res.data.find(
							(item: ProjectItem) =>
								item.projectId === currentProject?.projectId
						)
					)
						setCurrentProject(res.data[0]);
					storage.setLocal('project', JSON.stringify(res.data[0]));
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				setProjectLoading(false);
			});
	};
	const getMiddlewareData = (projectId: string) => {
		setMiddlewareLoading(true);
		getProjectMiddleware({ projectId })
			.then((res) => {
				if (res.success) {
					setTableDataSource(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				setMiddlewareLoading(false);
			});
	};
	const aliasNameRender = (
		text: string,
		record: ProjectItem,
		index: number
	) => {
		return (
			<span
				className="name-link"
				onClick={() => {
					history.push(
						`/myProject/projectDetail/${record.projectId}`
					);
				}}
			>
				{text}
			</span>
		);
	};
	const middlewareCountRender = (
		text: string,
		record: ProjectItem,
		index: number
	) => {
		return (
			<span>
				{
					projectMiddlewareCount?.find(
						(mid: ProjectItem) => mid.projectId === record.projectId
					)?.middlewareCount
				}
			</span>
		);
	};
	const actionRender = (text: string, record: ProjectItem, index: number) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						setEditVisible(true);
					}}
				>
					编辑信息
				</LinkButton>
			</Actions>
		);
	};
	return (
		<ProPage>
			<ProHeader
				avatar={{
					icon: <img src={projectIcon} width={80} />
				}}
				title="我的项目"
				subTitle="管理用户自己的项目"
			/>
			<ProContent style={{ width: '100%' }}>
				<ProTable
					dataSource={dataSource}
					rowKey="projectId"
					loading={projectLoading}
				>
					<ProTable.Column
						title="项目名称"
						dataIndex="aliasName"
						render={aliasNameRender}
					/>
					<ProTable.Column
						title="项目角色"
						dataIndex="roleName"
						ellipsis={true}
					/>
					<ProTable.Column
						title="英文简称"
						dataIndex="name"
						ellipsis={true}
					/>
					<ProTable.Column
						title="命名空间"
						dataIndex="namespaceCount"
					/>
					<ProTable.Column title="成员数" dataIndex="memberCount" />
					<ProTable.Column
						title="服务数"
						dataIndex="middlewareCount"
						render={middlewareCountRender}
					/>
					<ProTable.Column
						title="备注"
						dataIndex="description"
						render={nullRender}
						ellipsis={true}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						render={actionRender}
					/>
				</ProTable>
				{/* <Spin
					spinning={projectLoading}
					tip="加载中，请稍后"
					// size="medium"
					// style={{ display: 'block' }}
				>
					<div className="zeus-my-project-card-list-content">
						{dataSource.map((item: ProjectItem) => {
							return (
								<div
									key={item.projectId}
									className={`zeus-my-project-card-item ${
										currentProject?.projectId ===
										item.projectId
											? 'my-project-active'
											: ''
									}`}
									onClick={() => {
										setCurrentProject(item);
										setProject(item);
										setRefreshCluster(true);
										setMenuRefresh(true);
										storage.setLocal(
											'project',
											JSON.stringify(item)
										);
									}}
								>
									<div className="zeus-my-project-card-title-content">
										<div className="zeus-my-project-card-h2">
											{item.aliasName}
										</div>
										<div
											className="zeus-my-project-card-action"
											style={{
												visibility:
													item.roleId === 2
														? 'visible'
														: 'hidden'
											}}
										>
											<div
												className="name-link"
												onClick={() => {
													storage.setLocal(
														'project',
														JSON.stringify(item)
													);
													setEditVisible(true);
													setProject(item);
													setMenuRefresh(true);
													setRefreshCluster(true);
												}}
											>
												编辑
											</div>
											<div
												className="name-link"
												onClick={() => {
													history.push(
														`/myProject/projectDetail/${item.projectId}`
													);
													storage.setLocal(
														'project',
														JSON.stringify(item)
													);
													setRefreshCluster(true);
													setProject(item);
													setMenuRefresh(true);
												}}
											>
												管理
											</div>
										</div>
									</div>
									<div className="red-tip">
										{item.roleName}
									</div>
									<div className="zeus-my-project-card-ul">
										<ul>
											<li>英文简称：{item.name}</li>
											<li>创建时间：{item.createTime}</li>
											<li>
												命名空间数：
												{item.namespaceCount}
											</li>
											<li>成员数：{item.memberCount}</li>
											<li>
												服务数：
												{
													projectMiddlewareCount?.find(
														(mid: ProjectItem) =>
															mid.projectId ===
															item.projectId
													)?.middlewareCount
												}
											</li>
											<li>备注：{item.description}</li>
										</ul>
									</div>
								</div>
							);
						})}
					</div>
				</Spin>
				<Spin
					spinning={middlewareLoading}
					tip="加载中，请稍后"
					// size="medium"
					// style={{ display: 'block' }}
				>
					<div className="zeus-my-project-table-list-content">
						{tableDataSource &&
							tableDataSource.map((item: MiddlewareTableItem) => {
								return (
									<MiddlewareTable
										key={item.type}
										data={item}
									/>
								);
							})}
						{tableDataSource.length === 0 && (
							<div className="display-flex flex-column flex-center">
								<img
									width={140}
									height={140}
									src={imgNone}
									alt=""
								/>
								<p>暂时没有数据</p>
							</div>
						)}
					</div>
				</Spin> */}
			</ProContent>
			{editVisible && (
				<EditProjectForm
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					onRefresh={getData}
				/>
			)}
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps, {
	setProject,
	setRefreshCluster,
	setMenuRefresh
})(MyProject);
