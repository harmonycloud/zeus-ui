import React, { useState } from 'react';
import SecondLayout from '@/components/SecondLayout';
import BackupRecovery from '@/pages/ServiceListDetail/BackupRecovery';
import NoService from '@/components/NoService';
import { notification } from 'antd';

import { getMiddlewareDetail } from '@/services/middleware';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import storage from '@/utils/storage';
import { clusterType, StoreState, User } from '@/types';
import { connect } from 'react-redux';
import { ProjectItem } from '../ProjectManage/project';

interface DataSecurityProps {
	project: ProjectItem;
}
function DataSecurity(props: DataSecurityProps): JSX.Element {
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
				storage: cluster.storage
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
	const NotSupport = () => {
		setData(undefined);
		setOperateFlag(true);
		return (
			<h3 style={{ textAlign: 'center' }}>
				该中间件类型不支持该功能，请选择mysql或者elasticsearch类型的中间件
			</h3>
		);
	};
	const NotAuth = () => {
		setData(undefined);
		setIsService(true);
		return <h3 style={{ textAlign: 'center' }}>当前用户无该操作权限！</h3>;
	};
	return (
		<SecondLayout
			title="数据安全"
			subTitle="主要用于数据的备份及恢复"
			hasBackArrow={true}
			onChange={onChange}
		>
			{basicData?.type !== 'mysql' &&
				basicData?.type !== 'elasticsearch' &&
				isService &&
				operateFlag && <NotSupport />}
			{(basicData?.type === 'mysql' ||
				basicData?.type === 'elasticsearch') &&
				isService &&
				operateFlag &&
				JSON.stringify(data) !== '{}' && (
					<BackupRecovery
						type={basicData?.type}
						data={data}
						storage={basicData?.storage}
						clusterId={basicData?.clusterId}
						namespace={basicData?.namespace}
						customMid={data?.dynamicValues !== null}
						capabilities={(data && data.capabilities) || []}
						dataSecurity={true}
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
export default connect(mapStateToProps)(DataSecurity);
