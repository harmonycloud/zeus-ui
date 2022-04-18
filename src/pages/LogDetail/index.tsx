import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import SecondLayout from '@/components/SecondLayout';
import Log from '@/pages/ServiceListDetail/Log';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import NoService from '@/components/NoService';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType, StoreState, User } from '@/types';
import { connect } from 'react-redux';
import { ProjectItem } from '../ProjectManage/project';
import storage from '@/utils/storage';

interface LogDetailProps {
	project: ProjectItem;
}
function LogDetail(props: LogDetailProps): JSX.Element {
	const { project } = props;
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const [operateFlag, setOperateFlag] = useState<boolean>(false);
	const onChange = (
		name: string | null,
		type: string,
		namespace: string,
		cluster: clusterType
	) => {
		if (name !== null) {
			setBasicData({
				name,
				type,
				clusterId: cluster.id,
				namespace,
				logging: cluster.logging
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
						Message.show(messageConfig('error', '失败', res));
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
	const getData = () => {
		getMiddlewareDetail({
			clusterId: basicData?.clusterId,
			namespace: basicData?.namespace,
			type: basicData?.type,
			middlewareName: basicData?.name
		}).then((res) => {
			if (res.success) {
				setIsService(true);
				setData(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const NotAuth = () => {
		setData(undefined);
		setIsService(true);
		return <h3 style={{ textAlign: 'center' }}>当前用户无该操作权限！</h3>;
	};
	return (
		<SecondLayout
			title="日志详情"
			subTitle="用于中间件服务的日志查询"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService &&
				data &&
				operateFlag &&
				JSON.stringify(data) !== '{}' && (
					<Log
						type={basicData?.type as string}
						data={data}
						middlewareName={basicData?.name as string}
						clusterId={basicData?.clusterId as string}
						namespace={basicData?.namespace as string}
						customMid={data?.dynamicValues !== null}
						capabilities={data?.capabilities || []}
						logging={basicData?.logging}
						onRefresh={getData}
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
export default connect(mapStateToProps)(LogDetail);
