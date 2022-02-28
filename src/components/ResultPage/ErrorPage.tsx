import React from 'react';
import { Icon, Button } from '@alicloud/console-components';
import { Content } from '@alicloud/console-components-page';
import { ErrorPageProps } from './resultpage';
import './index.scss';

export default function ErrorPage(props: ErrorPageProps): JSX.Element {
	const { title, btnText, btnHandle } = props;
	return (
		<Content>
			<div className="zeus-success-content">
				<Icon type="error" style={{ color: '#Ef595C' }} />
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
