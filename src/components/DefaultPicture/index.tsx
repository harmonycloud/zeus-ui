import React from 'react';
import noData from '@/assets/images/nodata.svg';

import './index.scss';

export interface DefaultPictureProps {
	title?: string;
}
export default function DefaultPicture(
	props: DefaultPictureProps
): JSX.Element {
	const { title = '该中间件不支持当前功能' } = props;
	return (
		<div className="default-picture-content">
			<img width={140} height={140} src={noData} />
			<p>{title}</p>
		</div>
	);
}
