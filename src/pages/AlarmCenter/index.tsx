import React from 'react';
import SecondLayout from '@/components/SecondLayout';
import ThresholdAlarm from '@/pages/InstanceList/Detail/ThresholdAlarm';

export default function AlarmCenter(): JSX.Element {
	return (
		<SecondLayout
			title="告警中心"
			subTitle="中间件服务的相关运行指标可进行监测和告警"
			hasBackArrow={true}
		>
			{/* <ThresholdAlarm /> */}
		</SecondLayout>
	);
}
