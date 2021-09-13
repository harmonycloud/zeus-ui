import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import SecondLayout from '@/components/SecondLayout';
import ThresholdAlarm from '@/pages/InstanceList/Detail/ThresholdAlarm';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import NoService from '@/components/NoService';
import {
	middlewareDetailProps,
	basicDataProps,
	monitorProps
} from '@/types/comment';

function AlarmCenter(): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const onChange = (
		name: string,
		type: string,
		clusterId: string,
		namespace: string,
		monitor: monitorProps
	) => {
		if (name !== type) {
			setBasicData({
				name,
				type,
				clusterId,
				namespace,
				monitor
			});
			getMiddlewareDetail({
				clusterId,
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
			title="告警中心"
			subTitle="中间件服务的相关运行指标可进行监测和告警"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService && JSON.stringify(data) !== '{}' && (
				<ThresholdAlarm
					middlewareName={basicData?.name}
					clusterId={basicData?.clusterId}
					namespace={basicData?.namespace}
					type={basicData?.type}
					customMid={data?.dynamicValues !== null}
					capabilities={data?.capabilities || []}
				/>
			)}
			{!isService && <NoService />}
		</SecondLayout>
	);
}
export default AlarmCenter;
