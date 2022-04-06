import React, { useState, useEffect } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import {
	getProjects,
	getProjectMiddleware,
	getProjectMiddlewareCount
} from '@/services/project';
import { setProject, setRefreshCluster } from '@/redux/globalVar/var';
import EditProjectForm from './editProjectForm';
import MiddlewareTable from './middlewareTable';
import { ProjectItem } from '../ProjectManage/project';
import { Message, Loading } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import imgNone from '@/assets/images/nodata.svg';
import storage from '@/utils/storage';
import { MiddlewareTableItem, MyProjectProps } from './myProject';
import { StoreState } from '@/types';
import './index.scss';

function MyProject(props: MyProjectProps): JSX.Element {
	const { setProject, setRefreshCluster, project } = props;
	const history = useHistory();
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
		if (
			JSON.stringify(currentProject) !== '{}' &&
			currentProject !== undefined
		) {
			getData();
			getProjectMiddlewareCount().then((res) => {
				if (res.success) {
					setProjectMiddleware(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, []);
	useEffect(() => {
		if (
			JSON.stringify(currentProject) !== '{}' &&
			currentProject !== undefined
		) {
			getMiddlewareData(currentProject.projectId);
		}
	}, [currentProject]);
	const getData = () => {
		setProjectLoading(true);
		getProjects()
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
					Message.show(messageConfig('error', '失败', res));
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
					Message.show(messageConfig('error', '失败', res));
				}
			})
			.finally(() => {
				setMiddlewareLoading(false);
			});
	};
	return (
		<Page>
			<Header title="我的项目" subTitle="管理用户自己的项目" />
			<Content style={{ width: '100%' }}>
				<Loading
					visible={projectLoading}
					tip="加载中，请稍后"
					size="medium"
					style={{ display: 'block' }}
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
													projectMiddlewareCount.find(
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
				</Loading>
				<Loading
					visible={middlewareLoading}
					tip="加载中，请稍后"
					size="medium"
					style={{ display: 'block' }}
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
				</Loading>
			</Content>
			{editVisible && (
				<EditProjectForm
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					onRefresh={getData}
				/>
			)}
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps, {
	setProject,
	setRefreshCluster
})(MyProject);
