import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
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
		children,
		countDown
	} = props;
	const [time, setTime] = useState<number>(5);
	useEffect(() => {
		let timer: any = null;
		if (countDown !== -1) {
			let count = time;
			timer = setInterval(() => {
				if (count === -1) {
					clearInterval(timer);
					timer = null;
					leftHandle();
				} else {
					setTime(count--);
				}
			}, 900);
		}
		return () => {
			clearInterval(timer);
		};
	}, [time]);
	return (
		<div className="zeus-result-content">
			<CheckCircleFilled style={{ color: '#68B642', fontSize: 64 }} />
			<p className="zeus-result-title">{title}</p>
			{children}
			<div className="zeus-button-content">
				{leftBtn && (
					<Button type="primary" onClick={leftHandle}>
						{leftText}
						{countDown ? `(${time}s)` : ''}
					</Button>
				)}
				{rightBtn && <Button onClick={rightHandle}>{rightText}</Button>}
			</div>
		</div>
	);
}
