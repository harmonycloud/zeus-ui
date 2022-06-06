import React from 'react';
import styles from './formblock.module.scss';
import { formBlockProps } from './formBlock';
export default function FormBlock(props: formBlockProps): JSX.Element {
	const { title, className = '', style = {}, children } = props;
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
			{children ? (
				children
			) : (
				<div className={styles['form-block-none']}></div>
			)}
		</div>
	);
}
