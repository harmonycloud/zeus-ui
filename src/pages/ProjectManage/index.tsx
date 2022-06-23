import React, { useState, useEffect } from 'react';
import { Button, Modal, notification } from 'antd';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import { ProHeader, ProContent, ProPage } from '@/components/ProPage';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import EditProjectForm from './editProjectForm';
import UpdateProjectFrom from '../MyProject/editProjectForm';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { getProjects, deleteProject } from '@/services/project';
import { nullRender } from '@/utils/utils';
import { ProjectItem, ProjectManageProps } from './project';
import { getIsAccessGYT } from '@/services/common';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
function ProjectManage(props: ProjectManageProps): JSX.Element {
	const { setRefreshCluster } = props;
	const [dataSource, setDataSource] = useState<ProjectItem[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [editData, setEditData] = useState<ProjectItem>();
	const [isAccess, setIsAccess] = useState<boolean>(false);
	const history = useHistory();
	useEffect(() => {
		getData();
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	const getData = (key = '') => {
		getProjects({ key }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const Operation = {
		primary: (
			<Button
				onClick={() => {
					console.log('click');
					setVisible(true);
				}}
				disabled={isAccess}
				title={isAccess ? '平台已接入观云台，请联系观云台管理员' : ''}
				type="primary"
			>
				新增项目
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		getData(value);
	};
	const nameRender = (value: string, record: ProjectItem, index: number) => {
		return (
			<div
				style={{ width: 250 }}
				className="text-overflow name-link"
				title={value}
				onClick={() => {
					history.push(
						`/systemManagement/projectManagement/projectDetail/${record.projectId}/${record.aliasName}`
					);
				}}
			>
				{value}
			</div>
		);
	};
	const nullToZeroRender = (value: string) => {
		return value || 0;
	};
	const actionRender = (
		value: string,
		record: ProjectItem,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						setEditVisible(true);
						setEditData(record);
						setRefreshCluster(true);
					}}
					disabled={isAccess}
					title={
						isAccess ? '平台已接入观云台，请联系观云台管理员' : ''
					}
				>
					编辑
				</LinkButton>
				<LinkButton
					disabled={isAccess}
					title={
						isAccess ? '平台已接入观云台，请联系观云台管理员' : ''
					}
					onClick={() =>
						confirm({
							title: '删除项目确认',
							content: '删除将无法找回，是否继续？',
							okText: '确定',
							cancelText: '取消',
							onOk() {
								return deleteProject({
									projectId: record.projectId
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '项目删除成功！'
										});
										setRefreshCluster(true);
										getData();
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
								});
							},
							onCancel() {
								console.log('cancel');
							}
						})
					}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<>
			<ProPage>
				<ProHeader title="项目管理" subTitle="管理所属用户的不同项目" />
				<ProContent>
					<ProTable
						dataSource={dataSource}
						showRefresh
						onRefresh={() => getData()}
						rowKey="name"
						operation={Operation}
						showColumnSetting
						search={{
							onSearch: handleSearch,
							placeholder: '请输入关键字搜索'
						}}
					>
						<ProTable.Column
							title="项目名称"
							dataIndex="aliasName"
							render={nameRender}
							width={250}
							fixed="left"
						/>
						<ProTable.Column
							title="成员数"
							dataIndex="memberCount"
							width={100}
							render={nullToZeroRender}
						/>
						<ProTable.Column
							title="命名空间数"
							dataIndex="namespaceCount"
							width={100}
							render={nullToZeroRender}
						/>
						<ProTable.Column
							title="备注"
							dataIndex="description"
							render={nullRender}
						/>
						<ProTable.Column
							title="操作"
							dataIndex="action"
							render={actionRender}
							width={180}
						/>
					</ProTable>
				</ProContent>
			</ProPage>
			{visible && (
				<EditProjectForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onRefresh={getData}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
			{editVisible && editData && (
				<UpdateProjectFrom
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					onRefresh={getData}
					project={editData}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
		</>
	);
}
const mapStateToProps = () => ({});
export default connect(mapStateToProps, {
	setRefreshCluster
})(ProjectManage);
