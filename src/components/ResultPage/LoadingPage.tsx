import React from 'react';
import { Content } from '@alicloud/console-components-page';
import { Button, Icon } from '@alicloud/console-components';
import { LoadingPageProps } from './resultpage';
import './index.scss';

export default function LoadingPage(props: LoadingPageProps): JSX.Element {
	const { title, btnText, btnHandle } = props;
	return (
		<Content>
			<div className="zeus-success-content">
				<Icon type="warning" style={{ color: '#0070cc' }} />
				<h2>{title}</h2>
				<div>
					<Button type="primary" onClick={btnHandle}>
						{btnText}
					</Button>
				</div>
			</div>
		</Content>
	);
}
