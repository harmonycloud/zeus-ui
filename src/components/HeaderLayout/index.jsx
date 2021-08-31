import React from 'react';
import './index.scss';

export default function HeaderLayout(props) {
	const { left, right, className = '', style = {}, flex = [] } = props;
	return (
		<div className={`headerLayout ${className}`} style={style}>
			{flex.length ? (
				<>
					<div
						className="headerLayout-left"
						style={{ flex: flex[0] }}
					>
						{left}
					</div>
					<div style={{ flex: flex[1] }}>{right}</div>
				</>
			) : (
				<>
					<div className="headerLayout-left">{left}</div>
					<div>{right}</div>
				</>
			)}
		</div>
	);
}
