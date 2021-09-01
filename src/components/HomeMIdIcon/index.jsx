import React from 'react';
import styles from './homeMidIcon.module.scss';
import { Badge } from '@alicloud/console-components';
import { useHistory } from 'react-router-dom';
import otherColor from '@/assets/images/nodata.svg';
import { api } from '@/api.json';

const typeMap = {
	elasticsearch: 'elasticsearch',
	rocketmq: 'rocketmq',
	mysql: 'mysql',
	redis: 'redis'
};

export default function HomeMidIcon(props) {
	const { type, count, flag, imagePath = null } = props;
	const history = useHistory();

	return (
		<>
			<div
				className={styles['middleware-box']}
				onClick={() =>
					history.push({
						pathname: '/instanceList',
						query: { key: typeMap[type] || type }
					})
				}
			>
				<Badge
					count={count}
					style={{
						backgroundColor: flag ? '#00A700' : '#C80000'
					}}
					title={type}
				>
					<img
						src={
							imagePath
								? `${api}/images/middleware/${imagePath}`
								: otherColor
						}
						className={count === 0 ? 'grey-img' : ''}
						width={40}
						height={40}
						alt={type}
					/>
				</Badge>
				<p>{typeMap[type] || type}</p>
			</div>
		</>
	);
}
