import * as React from 'react';
import { PageProps } from './page';

function ProContent(props: PageProps): JSX.Element {
	const { className, style } = props;

	return (
		<div
			className={`pro-content${className ? ' ' + className : ''}`}
			style={style}
		>
			{props.children}
		</div>
	);
}

export default ProContent;
