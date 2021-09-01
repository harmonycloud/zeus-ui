import React from 'react';
import styles from './icon.module.scss';

export default function Icon(props) {
	const {
		iconName,
		size = 'md',
		style = {},
		className = '',
		color,
		onClick
	} = props;
	const iconSize = `icon-${size}`;
	return (
		<svg
			className={`${styles['icon']} ${styles[iconSize]} ${className}`}
			style={{ ...style, color: color }}
			aria-hidden="true"
			onClick={(event) => onClick && onClick(event)}
		>
			<use xlinkHref={`#${iconName}`}></use>
		</svg>
	);
}
