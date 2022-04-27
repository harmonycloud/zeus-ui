import * as React from 'react';
import { PageProps } from './page';

function ProPage(props: PageProps): JSX.Element {
	const { className } = props;

	return (
		<div className="page">
			<div></div>
			<div className={`pro-page${className ? ' ' + className : ''}`}>
				<div className="page-container">{props.children[0]}</div>
				<div className="page-container">{props.children[1]}</div>
			</div>
		</div>
	);
}

export default ProPage;
