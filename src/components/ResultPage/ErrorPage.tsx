import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import { ErrorPageProps } from './resultpage';
import './index.scss';

export default function ErrorPage(props: ErrorPageProps): JSX.Element {
	const { title, btnText, btnHandle, countDown } = props;
	const [time, setTime] = useState<number>(5);
	useEffect(() => {
		let timer: any = null;
		if (countDown !== -1) {
			let count = time;
			timer = setInterval(() => {
				if (count === -1) {
					clearInterval(timer);
					timer = null;
					btnHandle();
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
			<CloseCircleFilled style={{ color: '#Ef595C', fontSize: 64 }} />
			<p className="zeus-result-title">{title}</p>
			<div>
				<Button type="primary" onClick={btnHandle}>
					{btnText}
					{countDown ? `(${time}s)` : ''}
				</Button>
			</div>
		</div>
	);
}
