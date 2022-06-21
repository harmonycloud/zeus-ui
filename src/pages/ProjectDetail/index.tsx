import React, { useEffect, useState } from 'react';
import { useLocation, useHistory, useParams } from 'react-router';
import { ProHeader, ProContent, ProPage } from '@/components/ProPage';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import Namespace from './namespace';
import Member from './member';
import { StoreState } from '@/types';
import { DetailParams } from './projectDetail';
import ServiceList from './serviceList';
import { roleProps } from '../RoleManage/role';
import storage from '@/utils/storage';

const { TabPane } = Tabs;
// ! 我的项目的项目详情和项目管理的项目详情共用一个页面
function ProjectDetail(): JSX.Element {
	const [activeKey, setActiveKey] = useState<string>('service');
	const location = useLocation();
	const history = useHistory();
	const params: DetailParams = useParams();
	const [role] = useState<roleProps>(JSON.parse(storage.getLocal('role')));
	const [disabledFlag, setDisabledFlag] = useState<boolean>(true);
	useEffect(() => {
		if (role.isAdmin) {
			setDisabledFlag(false);
		} else {
			if (
				role.userRoleList.find(
					(item: any) => item.projectId === params.id
				).roleId === 2
			) {
				setDisabledFlag(false);
			}
		}
	}, [role]);
	const onChange = (key: string | number) => {
		setActiveKey(key as string);
	};

	return (
		<ProPage>
			<ProHeader
				title="项目详情"
				subTitle="管理用户自己的项目"
				onBack={() => {
					if (location.pathname.includes('my')) {
						history.push('/myProject');
					} else {
						history.push('/systemManagement/projectManagement');
					}
				}}
			/>
			<ProContent>
				<Tabs activeKey={activeKey} onChange={onChange}>
					<TabPane tab="服务列表" key="service">
						<ServiceList />
					</TabPane>
					{!disabledFlag && (
						<TabPane tab="命名空间" key="namespace">
							<Namespace />
						</TabPane>
					)}
					{!disabledFlag && (
						<TabPane tab="成员管理" key="member">
							<Member />
						</TabPane>
					)}
				</Tabs>
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(ProjectDetail);
