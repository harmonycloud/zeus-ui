import React from 'react';
import { Progress } from '@alicloud/console-components';
import { api } from '@/api.json';

import styles from './authManage.module.scss';

export default function Card(props) {
	const { middleware } = props;
	return (
		<div className={styles['middleware-card']}>
			<div className={styles['type']}>
				<span className={`display-inline-block ${styles['gray-box']}`}>
					{middleware.middlewareInfo.type}
				</span>
			</div>
			<div className={`display-flex ${styles['info']}`}>
				<img
					src={`${api}/images/middleware/${middleware.middlewareInfo.imagePath}`}
					alt=""
				/>
				<h1>{middleware.middlewareInfo.name}</h1>
				<p>{middleware.middlewareInfo.description}</p>
			</div>
			<div className={styles['quota']}>
				<p>
					授权实例数：
					{middleware.total}个
				</p>
				<div className={styles['process']}>
					<Progress
						// percent={
						// 	middleware.total === 0
						// 		? 0
						// 		: (middleware.used / middleware.total) * 100
						// }
						textRender={() => {
							return (
								<span>
									{Math.floor(
										(middleware.used / middleware.total) *
											10000
									) / 100}{' '}
									%
								</span>
							);
						}}
						size="large"
					/>
				</div>
				<div>
					<span style={{ marginRight: 89, color: '#999' }}>
						已使用 {middleware.used}个
					</span>
					<span>剩余 {middleware.total - middleware.used}个</span>
				</div>
			</div>
		</div>
	);
}
