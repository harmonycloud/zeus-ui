import React from 'react';
import noData from '@/assets/images/nodata.svg';
import './index.scss';

export default function DefaultPicture() {
	return (
		<div className="default-picture-content">
			<img width={140} height={140} src={noData} />
			<p>该中间件不支持当前功能</p>
		</div>
	);
}
