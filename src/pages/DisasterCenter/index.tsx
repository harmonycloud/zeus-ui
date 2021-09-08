import React from 'react';
import SecondLayout from '@/components/SecondLayout';
import Disaster from '@/pages/InstanceList/Detail/Disaster';

export default function DisasterCenter() {
	return (
		<SecondLayout
			title="灾备中心"
			subTitle="为保障中间件服务高可用性，可跨资源池创建备用服务，随时接手主服务的数据流量"
			hasBackArrow={true}
		>
			{/* <Disaster /> */}
		</SecondLayout>
	);
}
