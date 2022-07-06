import * as React from 'react';
import { PageProps } from './page';

function ProContent(props: PageProps): JSX.Element {
	const { className, style, menu } = props;

	return (
		<div
			className={`pro-content${className ? ' ' + className : ''}`}
			style={style}
		>
			{menu ? (
				<div className="pro-menu-content">
					{menu}
					<div className="content">{props.children}</div>
				</div>
			) : (
				props.children
			)}
		</div>
	);
}

export default ProContent;
