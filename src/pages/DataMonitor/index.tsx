import React, { useState } from 'react';
import SecondLayout from '@/components/SecondLayout';
import Monitor from '../InstanceList/Detail/Monitor';

function DataMonitor(): JSX.Element {
	const onChange = (value: string) => {
		console.log(value);
	};
	return (
		<SecondLayout
			title="数据监控"
			subTitle="所发布中间件服务相关指标的可视化数据展示"
			hasBackArrow={true}
			onChange={onChange}
		>
			{/* <Monitor /> */}
		</SecondLayout>
	);
}
export default DataMonitor;
