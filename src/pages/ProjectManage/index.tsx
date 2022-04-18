import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message } from '@alicloud/console-components';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import { Page, Header, Content } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import MidTable from '@/components/MidTable';
import EditProjectForm from './editProjectForm';
import UpdateProjectFrom from '../MyProject/editProjectForm';
import { setProject, setRefreshCluster } from '@/redux/globalVar/var';
import { getProjects, deleteProject } from '@/services/project';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import { ProjectItem, ProjectManageProps } from './project';
import storage from '@/utils/storage';

function ProjectManage(props: ProjectManageProps): JSX.Element {
	const { setProject, setRefreshCluster } = props;
	const [dataSource, setDataSource] = useState<ProjectItem[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const history = useHistory();
	useEffect(() => {
		getData();
	}, []);
	const getData = (key = keyword) => {
		getProjects({ key }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const Operation = {
		primary: (
			<Button onClick={() => setVisible(true)} type="primary">
				新增项目
			</Button>
		)
	};
	const handleChange = (value: string) => {
		setKeyword(value);
	};
	const handleSearch = (value: string) => {
		getData(value);
	};
	const nameRender = (value: string, index: number, record: ProjectItem) => {
		return (
			<span
				className="text-overflow name-link"
				title={value}
				onClick={() => {
					storage.setLocal('project', JSON.stringify(record));
					history.push(
						`/systemManagement/projectManagement/projectDetail/${record.projectId}`
					);
				}}
			>
				{value}
			</span>
		);
	};
	const nullToZeroRender = (value: string) => {
		return value || 0;
	};
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						setEditVisible(true);
						setProject(record);
						storage.setLocal('project', JSON.stringify(record));
						setRefreshCluster(true);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton
					onClick={() => {
						Dialog.show({
							title: '删除项目确认',
							content: '删除将无法找回，是否继续？',
							onOk: () => {
								return deleteProject({
									projectId: record.projectId
								}).then((res) => {
									if (res.success) {
										Message.show(
											messageConfig(
												'success',
												'成功',
												'项目删除成功！'
											)
										);
										setRefreshCluster(true);
										getData();
									} else {
										Message.show(
											messageConfig('error', '失败', res)
										);
									}
								});
							}
						});
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<Page>
			<Header title="项目管理" subTitle="管理所属用户的不同项目" />
			<Content>
				<MidTable
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showRefresh
					onRefresh={() => getData()}
					primaryKey="name"
					operation={Operation}
					search={{
						value: keyword,
						onChange: handleChange,
						onSearch: handleSearch,
						placeholder: '请输入关键字搜索'
					}}
				>
					<MidTable.Column
						title="项目名称"
						dataIndex="aliasName"
						cell={nameRender}
						width={250}
						lock="left"
					/>
					<MidTable.Column
						title="成员数"
						dataIndex="memberCount"
						width={100}
						cell={nullToZeroRender}
					/>
					<MidTable.Column
						title="命名空间数"
						dataIndex="namespaceCount"
						width={100}
						cell={nullToZeroRender}
					/>
					<MidTable.Column
						title="备注"
						dataIndex="description"
						cell={nullRender}
					/>
					<MidTable.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={180}
					/>
				</MidTable>
			</Content>
			{visible && (
				<EditProjectForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onRefresh={getData}
					setRefreshCluster={setRefreshCluster}
				/>
			)}
			{editVisible && (
				<UpdateProjectFrom
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					onRefresh={getData}
				/>
			)}
		</Page>
	);
}
const mapStateToProps = () => ({});
export default connect(mapStateToProps, {
	setProject,
	setRefreshCluster
})(ProjectManage);
