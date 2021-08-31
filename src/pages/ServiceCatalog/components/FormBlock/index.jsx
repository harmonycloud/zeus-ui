import React from 'react';
import styles from './formblock.module.scss';

export default function FormBlock(props) {
	const { title, className = '', style = {}, children } = props;
	// console.log(typeof title);
	return (
		<div
			className={`${styles['form-block']} ${className}`}
			style={{ ...style }}
		>
			{typeof title === 'string' ? (
				<p className={styles['title']}>{title}</p>
			) : (
				<div className={styles['title']}>{title}</div>
			)}
			{children}
		</div>
	);
}
