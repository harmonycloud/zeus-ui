import React from 'react';
import './index.scss';
export default function LineLoading(props: { color?: string }): JSX.Element {
	const { color } = props;
	return (
		<div className="loader">
			<div className="loader-inner line-scale">
				<div style={color ? { backgroundColor: color } : {}}></div>
				<div style={color ? { backgroundColor: color } : {}}></div>
				<div style={color ? { backgroundColor: color } : {}}></div>
				<div style={color ? { backgroundColor: color } : {}}></div>
				<div style={color ? { backgroundColor: color } : {}}></div>
			</div>
		</div>
	);
}
