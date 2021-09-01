import React from 'react';
import './homeCard.scss';

export default function HomeCard(props) {
	const { height, width, title, marginBottom,action } = props;
	return (
		<div
			className="home-card"
			style={{ height: height, width: width, marginBottom: marginBottom }}
		>
			<div className="home-card-title-content">
				<div className="home-card-title">{title}</div>
				{action}
			</div>
			{props.children}
		</div>
	);
}
