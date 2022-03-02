import React from 'react';
import { Button, Icon } from '@alicloud/console-components';
import { LoadingPageProps } from './resultpage';
import './index.scss';

export default function LoadingPage(props: LoadingPageProps): JSX.Element {
	const { title, btnText, btnHandle } = props;
	return (
		<div className="zeus-result-content">
			<Icon size="xxxl" type="warning" style={{ color: '#0070cc' }} />
			<p className="zeus-result-title">{title}</p>
			<div>
				<Button type="primary" onClick={btnHandle}>
					{btnText}
				</Button>
			</div>
		</div>
	);
}
