import React from 'react';
import { Button, Icon } from '@alicloud/console-components';
import { SuccessPageProps } from './resultpage';
import './index.scss';

export default function SuccessPage(props: SuccessPageProps): JSX.Element {
	const {
		title,
		leftHandle = () => {
			console.log('left click');
		},
		rightHandle = () => {
			console.log('right click');
		},
		leftText = '返回列表',
		rightText = '返回列表',
		rightBtn = true,
		leftBtn = true,
		children
	} = props;
	return (
		<div className="zeus-result-content">
			<Icon
				size="xxxl"
				type="success-filling"
				style={{ color: '#68B642', height: 64 }}
			/>
			<p className="zeus-result-title">{title}</p>
			{children}
			<div className="zeus-button-content">
				{leftBtn && (
					<Button type="primary" onClick={leftHandle}>
						{leftText}
					</Button>
				)}
				{rightBtn && (
					<Button type="normal" onClick={rightHandle}>
						{rightText}
					</Button>
				)}
			</div>
		</div>
	);
}
