import React from 'react';
import { Collapse } from 'antd';
import { ListCardProps, ListCardItemProps } from './listcard.d';
import './index.scss';

const { Panel } = Collapse;
export const ListCardItem = (props: ListCardItemProps) => {
	const { width, label, value, render, style, icon } = props;
	const upValue = () => {
		if (value as string) {
			return (
				<div className="zeus-list-card-item-value" title={value}>
					{value}
				</div>
			);
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
		return (
			<div
				className="zeus-list-card-item-content"
				style={{ width: width, ...style }}
			>
				{render}
			</div>
		);
	}
	return (
		<div
			className="zeus-list-card-item-content"
			style={{ width: width, ...style }}
		>
			{icon}
			<div>
				{upValue()}
				{downValue()}
			</div>
		</div>
	);
};
export const ListCard = (props: ListCardProps) => {
	const {
		title,
		subTitle,
		icon,
		children,
		actionRender,
		titleClick,
		columnGap
	} = props;
	return (
		<div className="zeus-list-card-box">
			<div className="zeus-list-card-head">
				{icon}
				<div
					className={`zeus-list-card-title-content ${
						titleClick ? 'active' : ''
					}`}
				>
					<div
						className="zeus-list-card-title"
						onClick={titleClick ? titleClick : undefined}
					>
						{title}
					</div>
					<div className="zeus-list-card-subTitle">{subTitle}</div>
				</div>
			</div>
			<div
				className="zeus-list-card-content"
				style={{ columnGap: columnGap }}
			>
				{children}
			</div>
			<div className="zeus-list-card-action">{actionRender}</div>
		</div>
	);
};
export const ListPanel = (props: ListCardProps) => {
	const { title, subTitle, icon, children, actionRender, render, columnGap } =
		props;
	return (
		<Collapse>
			<Panel
				className="zeus-list-panel"
				key={1}
				header={
					<div
						className="zeus-list-panel-box"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="zeus-list-card-head">
							{icon}
							<div className="zeus-list-card-title-content">
								<div className="zeus-list-card-title">
									{title}
								</div>
								<div className="zeus-list-card-subTitle">
									{subTitle}
								</div>
							</div>
						</div>
						<div
							className="zeus-list-card-content"
							style={{ columnGap: columnGap }}
						>
							{children}
						</div>
						<div className="zeus-list-card-action">
							{actionRender}
						</div>
					</div>
				}
			>
				{render}
			</Panel>
		</Collapse>
	);
};
