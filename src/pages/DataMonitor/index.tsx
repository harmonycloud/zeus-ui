import React, { useState } from 'react';
import SecondLayout from '@/components/SecondLayout';
import Monitor from '../InstanceList/Detail/Monitor';

function DataMonitor(): JSX.Element {
	return (
		<SecondLayout
			title="数据监控"
			subTitle="所发布中间件服务相关指标的可视化数据展示"
			hasBackArrow={true}
		>
			{/* <Monitor /> */}
		</SecondLayout>
	);
}
export default DataMonitor;
