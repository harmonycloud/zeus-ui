import React, { useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { useHistory } from 'react-router';
import EditProjectForm from './editProjectForm';
import './index.scss';
import MiddlewareTable from './middlewareTable';
export default function MyProject(): JSX.Element {
	const history = useHistory();
	const [editVisible, setEditVisible] = useState<boolean>(false);
	return (
		<Page>
			<Header title="我的项目" subTitle="管理用户自己的项目" />
			<Content>
				<div className="zeus-my-project-card-list-content">
					<div className="zeus-my-project-card-item">
						<div className="zeus-my-project-card-title-content">
							<div>项目1</div>
							<div className="zeus-my-project-card-action">
								<div
									className="name-link"
									onClick={() => setEditVisible(true)}
								>
									编辑
								</div>
								<div
									className="name-link"
									onClick={() => {
										history.push(`/my/projectDetail/sss`);
									}}
								>
									管理
								</div>
							</div>
						</div>
						<div className="red-tip">项目管理员</div>
						<div className="zeus-my-project-card-ul">
							<ul>
								<li>
									英文简称：ddddddddddddddddddddddddddddddddddddddddddddddddddddddd
								</li>
								<li>创建时间：ddddd</li>
								<li>命名空间数：ddddd</li>
								<li>成员数：ddddd</li>
								<li>备注：ddddd</li>
							</ul>
						</div>
					</div>
					<div className="zeus-my-project-card-item my-project-active">
						<div className="zeus-my-project-card-title-content">
							<div>项目1</div>
							<div className="zeus-my-project-card-action">
								<div className="name-link">编辑</div>
								<div className="name-link">管理</div>
							</div>
						</div>
						<div className="red-tip">项目管理员</div>
						<div className="zeus-my-project-card-ul">
							<ul>
								<li>
									英文简称：ddddddddddddddddddddddddddddddddddddddddddddddddddddddd
								</li>
								<li>创建时间：ddddd</li>
								<li>命名空间数：ddddd</li>
								<li>成员数：ddddd</li>
								<li>备注：ddddd</li>
							</ul>
						</div>
					</div>
					<div className="zeus-my-project-card-item">
						<div className="zeus-my-project-card-title-content">
							<div>项目1</div>
							<div className="zeus-my-project-card-action">
								<div className="name-link">编辑</div>
								<div className="name-link">管理</div>
							</div>
						</div>
						<div className="red-tip">项目管理员</div>
						<div className="zeus-my-project-card-ul">
							<ul>
								<li>
									英文简称：ddddddddddddddddddddddddddddddddddddddddddddddddddddddd
								</li>
								<li>创建时间：ddddd</li>
								<li>命名空间数：ddddd</li>
								<li>成员数：ddddd</li>
								<li>备注：ddddd</li>
							</ul>
						</div>
					</div>
					<div className="zeus-my-project-card-item">
						<div className="zeus-my-project-card-title-content">
							<div>项目1</div>
							<div className="zeus-my-project-card-action">
								<div className="name-link">编辑</div>
								<div className="name-link">管理</div>
							</div>
						</div>
						<div className="red-tip">项目管理员</div>
						<div className="zeus-my-project-card-ul">
							<ul>
								<li>
									英文简称：ddddddddddddddddddddddddddddddddddddddddddddddddddddddd
								</li>
								<li>创建时间：ddddd</li>
								<li>命名空间数：ddddd</li>
								<li>成员数：ddddd</li>
								<li>备注：ddddd</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="zeus-my-project-table-list-content">
					<MiddlewareTable />
				</div>
			</Content>
			{editVisible && (
				<EditProjectForm
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
				/>
			)}
		</Page>
	);
}
