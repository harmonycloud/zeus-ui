import React from 'react';
import transBg from '@/assets/images/trans-bg.svg';
import './index.scss';
interface MidProcessProps {
	per: number | null;
	used: number | null;
	total: number | null;
	color?: string;
	right?: string;
	bottom?: string;
}
export default function MidProcess(props: MidProcessProps): JSX.Element {
	const {
		per,
		used,
		total,
		color = '#49A9E1',
		right = 'rgb(127, 177, 255)',
		bottom = 'rgb(122, 212, 255)'
	} = props;
	return (
		<div>
			<div className="cpu-content">
				<img src={transBg} />
				<div className="cpu-content-line">
					<div
						style={{
							height: 16,
							width: `${per}%`,
							backgroundImage: `linear-gradient(to right bottom, ${right}, ${bottom})`
						}}
					></div>
				</div>
				<div style={{ color: color }}>{(per || 0).toFixed(0)}%</div>
			</div>
			<div>
				{used ? used.toFixed(1) : '-'}/{total ? total.toFixed(1) : '-'}
			</div>
		</div>
	);
}
