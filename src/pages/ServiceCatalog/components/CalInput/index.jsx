import React, { useState, useEffect } from 'react';
import { Input, Icon } from '@alicloud/console-components';
import styles from './calinput.module.scss';

export default function CalInput(props) {
	const { value, onChange, disabled = false, min = 0, max } = props;
	let [num, setNum] = useState(0);
	let [minValue, setMinValue] = useState(0);
	let [maxValue, setMaxValue] = useState(Math.MAX_SAFE_INTEGER);

	useEffect(() => {
		if (value) {
			setNum(value);
		}
	}, [value]);

	useEffect(() => {
		if (min) {
			setMinValue(min);
		}
	}, [min]);

	useEffect(() => {
		if (max) {
			setMaxValue(max);
		}
	}, [max]);

	useEffect(() => {
		if (num) {
			onChange(num);
		}
	}, [num]);

	return (
		<Input
			disabled={disabled}
			value={num}
			min={minValue}
			max={maxValue}
			innerBefore={
				<Icon
					type="minus"
					className={`${styles['icon-input']} ${
						num <= minValue ? styles['icon-disabled'] : ''
					}`}
					onClick={(e) => {
						e.stopPropagation();
						if (num <= minValue) return;
						setNum(--num);
					}}
				/>
			}
			innerAfter={
				<Icon
					type="add"
					className={`${styles['icon-input']} ${
						num >= maxValue ? styles['icon-disabled'] : ''
					}`}
					onClick={(e) => {
						e.stopPropagation();
						if (num >= maxValue) return;
						setNum(++num);
					}}
				/>
			}
			htmlType="number"
			onChange={(value) => onChange(value)}
		/>
	);
}
