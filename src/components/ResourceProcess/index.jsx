import React from 'react';
import { Balloon } from '@alicloud/console-components';
import './resourceProcess.scss';
import otherColor from '@/assets/images/nodata.svg';
import { api } from '@/api.json';

export default function ResourceProcess(props) {
	const { list, label, total, type, style, useTotal } = props;
	const judgeColor = (index) => {
		switch (type) {
			case 'cpu':
				return index % 2 === 0 ? '#007DFA' : '#0064C8';
			case 'memory':
				return index % 2 === 0 ? '#6CF0DB' : '#5CCDBB';
			default:
				return;
		}
	};

	const judgeUnit = () => {
		switch (type) {
			case 'cpu':
				return 'Core';
			case 'memory':
				return 'Gi';
			default:
				return;
		}
	};

	const homeBalloon = (item) => (
		<div className="process-tip">
			<div className="process-image">
				<img
					src={
						item.imagePath
							? `${api}/images/middleware/${item.imagePath}`
							: otherColor
					}
					alt={item.type}
					width={70}
					height={70}
				/>
				<p>{item.name}</p>
			</div>
			<div className="process-content">
				节点数: {item.instance} <br />
				总CPU: {item.cpu.toFixed(2)} Core
				<br />
				总内存: {item.memory.toFixed(2)} Gi
				<br />
			</div>
		</div>
	);

	const calculate = (use, index, item) => {
		const percent = parseFloat(use / total).toFixed(4) * 100;
		const backgroundColor = judgeColor(index);
		return (
			<Balloon
				key={`${item.name}-${type}`}
				align="t"
				trigger={
					<div
						className="process-item"
						style={{
							width: `${percent}%`,
							background: `${backgroundColor}`
						}}
					></div>
				}
				closable={false}
			>
				{homeBalloon(item)}
			</Balloon>
		);
	};

	return (
		<div className="process-box" style={style}>
			<div className="process-label">{label}:</div>
			<div className="process-content">
				{list &&
					list.map((item, index) => {
						return calculate(item.num, index, item);
					})}
			</div>
			<div className="process-total">
				{useTotal.toFixed(2)}/{useTotal === total ? '∞ ' : total}
				{judgeUnit()}
			</div>
		</div>
	);
}
