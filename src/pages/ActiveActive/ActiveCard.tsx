import { IconFont } from '@/components/IconFont';
import React from 'react';
import { ActiveCardProps } from './activeActive';

export default function ActiveCard(props: ActiveCardProps): JSX.Element {
	const { title, status, isActive, areaNumber } = props;
	return (
		<div className="active-card-box">
			<div className="active-card-header">
				<IconFont
					type="icon-jiqun"
					style={{ fontSize: '48px', marginRight: '16px' }}
				/>
				<div className="active-card-title-box">
					<div className="active-card-title">{title}</div>
				</div>
			</div>
			<div className="active-card-footer">
				<div>{isActive ? '可用区已开启' : '可用区未开启'}</div>
				<div>可用区数量：{areaNumber}</div>
			</div>
		</div>
	);
}
