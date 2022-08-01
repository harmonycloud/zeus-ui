import { CaretRightOutlined } from '@ant-design/icons';
import React from 'react';
import './index.scss';

interface ArrowLineProps {
	label?: string;
	width?: string | number;
}
export default function ArrowLine(props: ArrowLineProps): JSX.Element {
	const { label, width } = props;
	return (
		<div className="arrow-line-content" style={{ width: width }}>
			<div className="arrow-line_line"></div>
			<div className="arrow-line_arrow">
				<CaretRightOutlined
					style={{
						color: '#8a8a8a',
						fontSize: 16,
						marginLeft: '-5px',
						marginTop: '3.5px'
					}}
				/>
			</div>
			{label && (
				<div className="arrow-line-label-box">
					<span className="arrow-line-label">{label}</span>
				</div>
			)}
		</div>
	);
}
