import React from 'react';
import { ListCardProps, ListCardItemProps } from './listcard.d';
import './index.scss';

export const ListCardItem = (props: ListCardItemProps) => {
	const { width, label, value, render } = props;
	const upValue = () => {
		if (value as string) {
			return <div className="zeus-list-card-item-value">{value}</div>;
		} else {
			return value;
		}
	};
	const downValue = () => {
		if (label as string) {
			return <div className="zeus-list-card-item-label">{label}</div>;
		} else {
			return label;
		}
	};
	if (render) {
		return render;
	}
	return (
		<div className="zeus-list-card-item-content" style={{ width: width }}>
			{upValue()}
			{downValue()}
		</div>
	);
};
export const ListCard = (props: ListCardProps) => {
	const { title, subTitle, icon, children, actionRender } = props;
	return (
		<div className="zeus-list-card-box">
			<div className="zeus-list-card-head">
				{icon}
				<div className="zeus-list-card-title-content">
					<div className="zeus-list-card-title">{title}</div>
					<div className="zeus-list-card-subTitle">{subTitle}</div>
				</div>
			</div>
			<div className="zeus-list-card-content">{children}</div>
			<div className="zeus-list-card-action">{actionRender}</div>
		</div>
	);
};
