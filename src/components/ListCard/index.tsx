import React from 'react';
import { Collapse, Row, Col } from 'antd';
import { ListCardProps, ListCardItemProps } from './listcard.d';
import './index.scss';

const { Panel } = Collapse;
export const ListCardItem = (props: ListCardItemProps) => {
	const { width, label, value, render, style } = props;
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
		return (
			<Col>
				<div
					className="zeus-list-card-item-content"
					style={{ width: width, ...style }}
				>
					{render}
				</div>
			</Col>
		);
	}
	return (
		<Col>
			<div
				className="zeus-list-card-item-content"
				style={{ width: width, ...style }}
			>
				{upValue()}
				{downValue()}
			</div>
		</Col>
	);
};
export const ListCard = (props: ListCardProps) => {
	const { title, subTitle, icon, children, actionRender, titleClick } = props;
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
			<div className="zeus-list-card-content">
				<Row justify="center">{children}</Row>
			</div>
			<div className="zeus-list-card-action">{actionRender}</div>
		</div>
	);
};
export const ListPanel = (props: ListCardProps) => {
	const { title, subTitle, icon, children, actionRender, render } = props;
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
						<div className="zeus-list-card-content">{children}</div>
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
