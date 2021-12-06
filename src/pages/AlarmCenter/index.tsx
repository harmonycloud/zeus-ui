import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import SecondLayout from '@/components/SecondLayout';
import AlarmRecord from '@/pages/SystemAlarm/alarmRecord';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import NoService from '@/components/NoService';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType } from '@/types';

function AlarmCenter(): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
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
export default AlarmCenter;
