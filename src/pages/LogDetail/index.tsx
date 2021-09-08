import React from 'react';
import SecondLayout from '@/components/SecondLayout';
import Log from '@/pages/InstanceList/Detail/Log';

export default function LogDetail(): JSX.Element {
	return (
		<SecondLayout
			title="日志详情"
			subTitle="用于中间件服务的日志查询"
			hasBackArrow={true}
		>
			{/* <Log /> */}
		</SecondLayout>
	);
}
