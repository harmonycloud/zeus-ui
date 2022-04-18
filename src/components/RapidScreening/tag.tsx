import React from 'react';
import './index.scss';

interface tagProps {
	data: {
		name: string;
		count: number;
	};
	flag: boolean;
	changeSelected: (value: string) => void;
}
export default function Tag(props: tagProps): JSX.Element {
	const { data, flag, changeSelected } = props;
	return (
		<div
			className={`tag-content ${flag ? 'selected' : ''}`}
			onClick={() => changeSelected(data.name)}
		>{`${data.name}(${data.count})`}</div>
	);
}
