import React from 'react';
import { Button, Icon } from '@alicloud/console-components';
import { Content } from '@alicloud/console-components-page';
import { SuccessPageProps } from './resultpage';
import './index.scss';

export default function SuccessPage(props: SuccessPageProps): JSX.Element {
	const { title, leftHandle, rightHandle, leftText, rightText } = props;
	return (
		<Content>
			<div className="zeus-success-content">
				<Icon
					size="xxxl"
					type="success-filling"
					style={{ color: '#68B642' }}
				/>
				<p className="zeus-result-title">{title}</p>
				<div className="zeus-button-content">
					<Button type="primary" onClick={leftHandle}>
						{leftText}
					</Button>
					<Button type="normal" onClick={rightHandle}>
						{rightText}
					</Button>
				</div>
			</div>
		</Content>
	);
}
