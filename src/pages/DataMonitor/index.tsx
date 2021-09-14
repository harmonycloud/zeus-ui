import React, { useState } from 'react';
import SecondLayout from '@/components/SecondLayout';
import Monitor from '../InstanceList/Detail/Monitor';
import { Message } from '@alicloud/console-components';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import NoService from '@/components/NoService';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType } from '@/types';

function DataMonitor(): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const onChange = (
		name: string,
		type: string,
		namespace: string,
		cluster: clusterType
	) => {
		if (name !== type) {
			setBasicData({
				name,
				type,
				clusterId: cluster.id,
				namespace,
				monitor: cluster.monitor
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
					Message.show(messageConfig('error', '失败', res));
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
					monitor={basicData?.monitor}
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
export default DataMonitor;
