import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import SecondLayout from '@/components/SecondLayout';
import AlarmRecord from '@/pages/SystemAlarm/alarmRecord';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import NoService from '@/components/NoService';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType, StoreState, User } from '@/types';
import { connect } from 'react-redux';
import { ProjectItem } from '../ProjectManage/project';
import storage from '@/utils/storage';

interface AlarmCenterProps {
	project: ProjectItem;
}
function AlarmCenter(props: AlarmCenterProps): JSX.Element {
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
	return (
		<SecondLayout
			title="服务告警"
			subTitle="中间件服务层面的告警"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService && JSON.stringify(data) !== '{}' && (
				<AlarmRecord
					middlewareName={basicData?.name}
					clusterId={basicData?.clusterId}
					namespace={basicData?.namespace}
					type={basicData?.type}
					customMid={data?.dynamicValues !== null}
					capabilities={data?.capabilities || []}
					monitor={basicData?.monitor}
				/>
			)}
			{!isService && <NoService />}
		</SecondLayout>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(AlarmCenter);
