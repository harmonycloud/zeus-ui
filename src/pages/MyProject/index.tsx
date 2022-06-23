import React, { useState, useEffect } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import { notification } from 'antd';
import { getProjects, getProjectMiddlewareCount } from '@/services/project';
import { setRefreshCluster } from '@/redux/globalVar/var';
import EditProjectForm from './editProjectForm';
import { MyProjectProps } from './myProject';
import { StoreState } from '@/types';
import { ProjectItem } from '../ProjectManage/project';
import { roleProps } from '../RoleManage/role';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';
import { nullRender } from '@/utils/utils';
import projectIcon from '@/assets/images/project.svg';
import './index.scss';
import { getIsAccessGYT } from '@/services/common';

const LinkButton = Actions.LinkButton;
function MyProject(props: MyProjectProps): JSX.Element {
	const { setRefreshCluster } = props;
	const history = useHistory();
	const [role, setRole] = useState<roleProps>();
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<ProjectItem[]>([]);
	const [editData, setEditData] = useState<ProjectItem>();
	const [projectLoading, setProjectLoading] = useState<boolean>(false);
	const [projectMiddlewareCount, setProjectMiddleware] = useState<
		ProjectItem[]
	>([]);
	const [isAccess, setIsAccess] = useState<boolean>(false);
	useEffect(() => {
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	useEffect(() => {
		// if (role) {
		// if (role.userRoleList.some((i: any) => i.roleId) === 1) {
		// 	if (
		// 		JSON.stringify(currentProject) !== '{}' &&
		// 		currentProject !== undefined
		// 	) {
		// 		getData();
		// 		getCount();
		// 	}
		// } else {
		getData();
		getCount();
		// }
		// }
	}, []);
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
	const aliasNameRender = (
		text: string,
		record: ProjectItem,
		index: number
	) => {
		return (
			<div>
				<img src={projectIcon} alt="项目" />
				<span
					className="name-link"
					onClick={() => {
						history.push(
							`/myProject/projectDetail/${record.projectId}/${record.aliasName}`
						);
					}}
					style={{ marginLeft: 8, verticalAlign: 'middle' }}
				>
					{text}
				</span>
			</div>
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
						setEditData(record);
						setEditVisible(true);
					}}
					disabled={record.roleId !== 2 || isAccess}
					title={
						isAccess
							? '平台已接入观云台，请联系观云台管理员'
							: record.roleId !== 2
							? '当前用户不具有该操作权限，请联系项目管理员'
							: ''
					}
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
					children: <img src={projectIcon} />,
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
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
			</ProContent>
			{editVisible && editData && (
				<EditProjectForm
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					onRefresh={getData}
					project={editData}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps, {
	setRefreshCluster
})(MyProject);
