import React from 'react';
import { SelectBlockProps } from '../SelectBlock/selectBlock';
import styles from './selectcard.module.scss';
import { IconFont } from '../IconFont';

/**
 * 块选择
 * @param { options current disabled } props 选项 当前项 是否是禁用状态
 */
export default function SelectCard(props: SelectBlockProps): JSX.Element {
	const {
		options = [],
		currentValue = '',
		onCallBack,
		disabled,
		itemStyle
	} = props;

	return (
		<div
			className={`display-flex ${styles['select-card']} ${
				disabled && styles['select-card-disabled']
			}`}
		>
			{options.map((option: any, index: number) => {
				return (
					<div
						key={index}
						style={itemStyle}
						className={`${styles['select-card-item']} ${
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
						<IconFont
							type={option.icon}
							style={{ fontSize: 40, marginBottom: 8 }}
						/>
						<span>{option.label}</span>
					</div>
				);
			})}
		</div>
	);
}
