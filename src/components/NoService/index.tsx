import React from 'react';
import { useHistory } from 'react-router';
import noData from '@/assets/images/nodata.svg';
import './index.scss';

export default function NoService() {
	const history = useHistory();
	const toCreate = () => {
		history.push('/middlewareRepository');
	};
	return (
		<div className="no-service-content">
			<img width={140} height={140} src={noData} />
			<p>
				暂无服务，请
				<span className="name-link" onClick={toCreate}>
					创建
				</span>
			</p>
		</div>
	);
}
