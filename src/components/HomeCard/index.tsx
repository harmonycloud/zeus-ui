import React from 'react';
import './homeCard.scss';
import { HomeCardProps } from './homeCard';

export default function HomeCard(props: HomeCardProps): JSX.Element {
	const { title, style, readMore, readMoreFn, children } = props;
	return (
		<div className="home-card" style={style}>
			<div className="home-card-title-content">
				<div className="home-card-title">
					<span>{title}</span>
					{readMore && (
						<span className="more" onClick={readMoreFn}>
							{readMore}
						</span>
					)}
				</div>
			</div>
			{children}
		</div>
	);
}
