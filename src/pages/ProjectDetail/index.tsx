import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { ProHeader, ProContent, ProPage } from '@/components/ProPage';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import Namespace from './namespace';
import Member from './member';
import { StoreState } from '@/types';
import { ProjectDetailProps } from './projectDetail';
import ServiceList from './serviceList';

const { TabPane } = Tabs;
function ProjectDetail(props: ProjectDetailProps): JSX.Element {
	const { project } = props;
	const [activeKey, setActiveKey] = useState<string>('namespace');
	const location = useLocation();
	const history = useHistory();
	const onChange = (key: string | number) => {
		setActiveKey(key as string);
	};
	useEffect(() => {
		if (location.pathname.includes('my')) {
			history.push(`/myProject/projectDetail/${project.projectId}`);
		}
	}, [project]);
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
					<TabPane tab="命名空间" key="namespace">
						<Namespace />
					</TabPane>
					<TabPane tab="成员管理" key="member">
						<Member />
					</TabPane>
				</Tabs>
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(ProjectDetail);
