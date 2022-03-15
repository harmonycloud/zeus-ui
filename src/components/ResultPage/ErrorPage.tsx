import React from 'react';
import { Icon, Button } from '@alicloud/console-components';
import { ErrorPageProps } from './resultpage';
import './index.scss';

export default function ErrorPage(props: ErrorPageProps): JSX.Element {
	const { title, btnText, btnHandle } = props;
	return (
		<div className="zeus-result-content">
			<Icon
				size="xxxl"
				type="error"
				style={{ color: '#Ef595C', height: 64 }}
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
