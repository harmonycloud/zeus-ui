import React, { useState } from 'react';
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
	addTitle?: string;
	titleStyle?: any;
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
		centerStyle,
		addTitle,
		titleStyle
	} = props;
	const [borderColor, setBorderColor] = useState<string>('#E9E9E9');
	const [titleColor, setTitleColor] = useState<string>('#333333');
	const [textColor, setTextColor] = useState<string>('#878787');
	return (
		<div
			className="mid-card-content"
			style={
				status === -1
					? { border: `1px dashed ${borderColor}`, boxShadow: 'none' }
					: {}
			}
			onMouseEnter={() => {
				if (status === -1) {
					setBorderColor('#0064C8');
					setTitleColor('#0064C8');
					setTextColor('#0064C8');
				}
			}}
			onMouseLeave={() => {
				if (status === -1) {
					setBorderColor('#E9E9E9');
					setTitleColor('#333333');
					setTextColor('#878787');
				}
			}}
		>
			<div className="mid-card-display">
				{status === -1 && (
					<div className="mid-card-add" style={{ color: titleColor }}>
						<Icon type="add" />
						{addTitle}
					</div>
				)}
				{status !== -1 && (
					<>
						<div
							className="mid-card-icon"
							style={{ backgroundColor: color }}
						>
							<CustomIcon
								type={icon}
								style={{
									color: '#FFFFFF',
									width: 40,
									fontSize: 40
								}}
							/>
						</div>
						<div className="mid-card-title">
							<div style={titleStyle}>{title}</div>
							<div className="mid-card-icon">
								{iconRender(status)}
							</div>
						</div>
					</>
				)}
			</div>
			{actionCount === 2 && (
				<div
					className="mid-card-action"
					style={
						status === -1
							? {
									borderTop: `1px dashed ${borderColor}`,
									borderRight: `1px dashed ${borderColor}`,
									borderBottom: `1px dashed ${borderColor}`,
									color: textColor
							  }
							: {}
					}
				>
					<div
						className="mid-card-left"
						onClick={leftHandle}
						style={
							status === -1
								? { borderRight: `1px solid ${borderColor}` }
								: {}
						}
					>
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
