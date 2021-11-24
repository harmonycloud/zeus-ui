import React from 'react';
import { Icon } from '@alicloud/console-components';
import CustomIcon from '../CustomIcon';
import './index.scss';

interface MidCardProps {
	color?: string;
	icon?: string;
	title?: string;
	status?: number;
	leftText?: string | '安装';
	rightText?: string | '接入';
	leftHandle?: () => void;
	rightHandle?: () => void;
	centerText?: string;
	centerHandle?: () => void;
	actionCount: number;
	centerStyle?: any;
}
export const iconRender = (status: number | undefined) => {
	switch (status) {
		case 3:
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					运行正常
				</>
			);
		case 4:
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					运行异常
				</>
			);
		default:
			return null;
	}
};
const MidCard = (props: MidCardProps) => {
	const {
		color,
		icon,
		title,
		status,
		leftText,
		rightText,
		leftHandle,
		rightHandle,
		actionCount,
		centerText,
		centerHandle,
		centerStyle
	} = props;
	return (
		<div className="mid-card-content">
			<div className="mid-card-display">
				<div
					className="mid-card-icon"
					style={{ backgroundColor: color }}
				>
					<CustomIcon
						type={icon}
						style={{ color: '#FFFFFF', width: 40, fontSize: 40 }}
					/>
				</div>
				<div className="mid-card-title">
					<div>{title}</div>
					<div className="mid-card-icon">{iconRender(status)}</div>
				</div>
			</div>
			{actionCount === 2 && (
				<div className="mid-card-action">
					<div className="mid-card-left" onClick={leftHandle}>
						{leftText}
					</div>
					<div className="mid-card-right" onClick={rightHandle}>
						{rightText}
					</div>
				</div>
			)}
			{actionCount === 1 && (
				<div
					className="mid-card-center"
					onClick={centerHandle}
					style={centerStyle}
				>
					{centerText}
				</div>
			)}
		</div>
	);
};
export default MidCard;
