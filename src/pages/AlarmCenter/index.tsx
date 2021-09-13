import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import SecondLayout from '@/components/SecondLayout';
import ThresholdAlarm from '@/pages/InstanceList/Detail/ThresholdAlarm';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { middlewareDetailProps } from '@/types/comment';

interface basicDataProps {
	name: string;
	type: string;
	clusterId: string;
	namespace: string;
}
function AlarmCenter(): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const onChange = (
		name: string,
		type: string,
		clusterId: string,
		namespace: string
	) => {
		if (name !== type) {
			setBasicData({
				name,
				type,
				clusterId,
				namespace
			});
			getMiddlewareDetail({
				clusterId,
				namespace,
				type,
				middlewareName: name
			}).then((res) => {
				console.log(res);
				if (res.success) {
					setData(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	};
	return (
		<SecondLayout
			title="告警中心"
			subTitle="中间件服务的相关运行指标可进行监测和告警"
			hasBackArrow={true}
			onChange={onChange}
		>
			{JSON.stringify(data) !== '{}' && (
				<ThresholdAlarm
					middlewareName={basicData?.name}
					clusterId={basicData?.clusterId}
					namespace={basicData?.namespace}
					type={basicData?.type}
					customMid={data?.dynamicValues !== null}
					capabilities={data?.capabilities || []}
				/>
			)}
		</SecondLayout>
	);
}
export default AlarmCenter;
