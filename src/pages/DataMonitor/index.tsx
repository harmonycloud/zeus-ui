import React, { useEffect, useState } from 'react';
import SecondLayout from '@/components/SecondLayout';
import Monitor from '../ServiceListDetail/Monitor';
import { notification } from 'antd';

import { getMiddlewareDetail } from '@/services/middleware';
import NoService from '@/components/NoService';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType, StoreState } from '@/types';
import { connect } from 'react-redux';
import { ProjectItem } from '../ProjectManage/project';
import { getComponents } from '@/services/common';

interface DataMonitorProps {
	project: ProjectItem;
}
function DataMonitor(props: DataMonitorProps): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const [grafanaOpen, setGrafanaOpen] = useState<boolean>(false);
	useEffect(() => {
		if (basicData) {
			getComponents({ clusterId: basicData?.clusterId }).then((res) => {
				if (res.success) {
					const grafanaTemp = res.data.find(
						(item: any) => item.component === 'grafana'
					).status;
					switch (grafanaTemp) {
						case 1:
							setGrafanaOpen(true);
							break;
						case 3:
							setGrafanaOpen(true);
							break;
						case 4:
							setGrafanaOpen(true);
							break;
						default:
							setGrafanaOpen(false);
							break;
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [basicData]);
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
				namespace
			});
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
					setIsService(false);
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		} else {
			setIsService(false);
		}
	};
	return (
		<SecondLayout
			title="数据监控"
			subTitle="所发布中间件服务相关指标的可视化数据展示"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService && JSON.stringify(data) !== '{}' && (
				<Monitor
					type={basicData?.type}
					middlewareName={basicData?.name}
					grafanaOpen={grafanaOpen}
					clusterId={basicData?.clusterId}
					namespace={basicData?.namespace}
					customMid={data?.dynamicValues !== null}
					chartVersion={data?.chartVersion}
					capabilities={(data && data.capabilities) || []}
				/>
			)}
			{!isService && <NoService />}
		</SecondLayout>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(DataMonitor);
