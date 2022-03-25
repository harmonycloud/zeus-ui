import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message } from '@alicloud/console-components';
import { useHistory } from 'react-router';
import { Page, Header, Content } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import MidTable from '@/components/MidTable';
import EditProjectForm from './editProjectForm';

import { getProjects, deleteProject } from '@/services/project';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';

export default function ProjectManage(): JSX.Element {
	const [dataSource, setDataSource] = useState([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const history = useHistory();
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getProjects().then((res) => {
			console.log(res);
		});
	};
	const Operation = {
		primary: (
			<Button onClick={() => setVisible(true)} type="primary">
				创建项目
			</Button>
		)
	};
	const handleChange = (value: string) => {
		setKeyword(value);
	};
	const handleSearch = (value: string) => {
		console.log(value);
	};
	const nameRender = (value: string, index: number, record: any) => {
		return (
			<span
				className="text-overflow name-link"
				onClick={() => console.log('to detail')}
			>
				{value}
			</span>
		);
	};
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton>编辑</LinkButton>
				<LinkButton
					onClick={() => {
						Dialog.show({
							title: '删除项目确认',
							content: '删除将无法找回，是否继续？',
							onOk: () => {
								return deleteProject({
									projectId: record.id
								}).then((res) => {
									if (res.success) {
										Message.show(
											messageConfig(
												'success',
												'成功',
												'项目删除成功！'
											)
										);
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
					onRefresh={getData}
					primaryKey="name"
					operation={Operation}
					search={{
						value: keyword,
						onChange: handleChange,
						onSearch: handleSearch,
						placeholder: '请输入关键词搜索'
					}}
				>
					<MidTable.Column
						title="项目名称"
						dataIndex="projectName"
						cell={nameRender}
						lock="left"
					/>
					<MidTable.Column title="成员数" dataIndex="memberCount" />
					<MidTable.Column
						title="命名空间数"
						dataIndex="namespaceCount"
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
					onCreate={() => console.log('create')}
				/>
			)}
		</Page>
	);
}
