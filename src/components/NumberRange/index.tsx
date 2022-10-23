import React, { useState } from 'react';
import './index.scss';
interface NumberRangeProps {
	unit: string;
	numberRange: (value: string[]) => void;
	style?: React.CSSProperties;
}

export default function NumberRange(props: NumberRangeProps): JSX.Element {
	const { unit, numberRange, style } = props;
	const [start, setStart] = useState<string>('');
	const [end, setEnd] = useState<string>('');
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: string
	) => {
		switch (type) {
			case 'start':
				setStart(e.target.value);
				break;
			case 'end':
				setEnd(e.target.value);
		}
	};
	const onBlur = () => {
		numberRange([start, end]);
	};

	return (
		<div id="number-range" style={style}>
			<input
				className="number-range-input left"
				type="number"
				value={start}
				onChange={(e) => handleChange(e, 'start')}
				onBlur={onBlur}
			></input>
			<div className="number-range-connect">&nbsp; ~ &nbsp;</div>
			<input
				className="number-range-input right"
				type="number"
				value={end}
				onChange={(e) => handleChange(e, 'end')}
				onBlur={onBlur}
			></input>
			{unit && <div className="number-range-unit">{unit}</div>}
		</div>
	);
}
