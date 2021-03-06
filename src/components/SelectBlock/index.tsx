import React from 'react';
import { SelectBlockProps } from './selectBlock';
import styles from './selectblock.module.scss';

/**
 * 块选择
 * @param { options current disabled } props 选项 当前项 是否是禁用状态
 */
export default function SelectBlock(props: SelectBlockProps): JSX.Element {
	const {
		options = [],
		currentValue = '',
		onCallBack,
		disabled,
		itemStyle
	} = props;

	return (
		<div
			className={`display-flex ${styles['select-box']} ${
				disabled && styles['select-box-disabled']
			}`}
		>
			{options.map((option: any, index: number) => {
				return (
					<div
						key={index}
						style={itemStyle}
						className={`${styles['select-box-item']} ${
							currentValue === option.value
								? styles['active']
								: ''
						} ${option.disabled ? styles['disabled'] : ''}`}
						onClick={() =>
							!disabled &&
							!option.disabled &&
							onCallBack &&
							onCallBack(option.value)
						}
						title={option.label}
					>
						{option.label}
					</div>
				);
			})}
		</div>
	);
}
