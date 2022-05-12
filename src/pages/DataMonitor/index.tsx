import React, { useState } from 'react';
import SecondLayout from '@/components/SecondLayout';
import Monitor from '../ServiceListDetail/Monitor';
import { notification } from 'antd';

import { getMiddlewareDetail } from '@/services/middleware';
import NoService from '@/components/NoService';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType, StoreState, User } from '@/types';
import { connect } from 'react-redux';
import { ProjectItem } from '../ProjectManage/project';
import storage from '@/utils/storage';

interface DataMonitorProps {
	project: ProjectItem;
}
function DataMonitor(props: DataMonitorProps): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const [operateFlag, setOperateFlag] = useState<boolean>(false);
	const { project } = props;
	const onChange = (
		name: string | null,
		type: string,
		namespace: string,
		cluster: clusterType
	) => {
		setData(undefined);
		if (name !== null) {
			setBasicData({
				name,
				type,
				clusterId: cluster.id,
				namespace,
				monitor: cluster.monitor
			});
			const jsonRole: User = JSON.parse(storage.getLocal('role'));
			let operateFlagTemp = false;
			if (jsonRole.userRoleList.some((item) => item.roleId === 1)) {
				operateFlagTemp = true;
			} else {
				operateFlagTemp =
					jsonRole.userRoleList.find(
						(item) => item.projectId === project.projectId
					)?.power[type][1] === '1'
						? true
						: false;
			}
			if (operateFlagTemp) {
				setOperateFlag(true);
				getMiddlewareDetail({
					clusterId: cluster.id,
					namespace,
					type,
					middlewareName: name
				}).then((res) => {
					if (res.success) {
						setIsService(true);
						setData(res.data);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				setIsService(false);
				setOperateFlag(false);
			}
		} else {
			setIsService(false);
		}
	};
	const NotAuth = () => {
		setData(undefined);
		setIsService(true);
		return <h3 style={{ textAlign: 'center' }}>当前用户无该操作权限！</h3>;
	};
	return (
		<SecondLayout
			title="数据监控"
			subTitle="所发布中间件服务相关指标的可视化数据展示"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService && operateFlag && JSON.stringify(data) !== '{}' && (
				<Monitor
					type={basicData?.type}
					middlewareName={basicData?.name}
					monitor={basicData?.monitor}
					clusterId={basicData?.clusterId}
					namespace={basicData?.namespace}
					customMid={data?.dynamicValues !== null}
					chartVersion={data?.chartVersion}
					capabilities={(data && data.capabilities) || []}
				/>
			)}
			{!isService && operateFlag && <NoService />}
			{!operateFlag && <NotAuth />}
		</SecondLayout>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(DataMonitor);
