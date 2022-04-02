import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { connect } from 'react-redux';
import { Tab } from '@alicloud/console-components';
import Namespace from './namespace';
import Member from './member';
import { StoreState } from '@/types';
import { ProjectDetailProps } from './projectDetail';

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
		<Page>
			<Header
				title="项目详情"
				subTitle="管理用户自己的项目"
				hasBackArrow
				onBackArrowClick={() => {
					if (location.pathname.includes('my')) {
						history.push('/myProject');
					} else {
						history.push('/systemManagement/projectManagement');
					}
				}}
			/>
			<Content>
				<Tab activeKey={activeKey} onChange={onChange}>
					<Tab.Item title="命名空间" key="namespace">
						<Namespace />
					</Tab.Item>
					<Tab.Item title="成员管理" key="member">
						<Member />
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(ProjectDetail);
