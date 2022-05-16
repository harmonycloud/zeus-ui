import React from 'react';
import { Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { LoadingPageProps } from './resultpage';
import './index.scss';

export default function LoadingPage(props: LoadingPageProps): JSX.Element {
	const { title, btnText, btnHandle } = props;
	return (
		<div className="zeus-result-content">
			<ExclamationCircleFilled
				style={{ color: '#0070cc', fontSize: 64 }}
			/>
			<p className="zeus-result-title">{title}</p>
			<div>
				<Button type="primary" onClick={btnHandle}>
					{btnText}
				</Button>
			</div>
		</div>
	);
}
