import React from 'react';
import './homeCard.scss';

export default function HomeCard(props) {
	const {
		height,
		width,
		title,
		marginBottom,
		action,
		marginLeft,
		readMore,
		readMoreFn
	} = props;
	return (
		<div
			className="home-card"
			style={{
				height: height,
				width: width,
				marginBottom: marginBottom,
				marginLeft
			}}
		>
			<div className="home-card-title-content">
				<div className="home-card-title">
					<span>{title}</span>
					{readMore && (
						<span className="more" onClick={readMoreFn}>
							{readMore}
						</span>
					)}
				</div>
				{action}
			</div>
			{props.children}
		</div>
	);
}
