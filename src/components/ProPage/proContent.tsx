import * as React from 'react';
import { PageProps } from './page';

function ProContent(props: PageProps): JSX.Element {
	const { className } = props;

	return (
		<div className={`pro-content${className ? ' ' + className : ''}`}>
			{props.children}
		</div>
	);
}

export default ProContent;
