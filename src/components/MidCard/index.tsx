import React, { useEffect, useState } from 'react';
import {
	CheckCircleFilled,
	CloseCircleFilled,
	ExclamationCircleFilled,
	PlusOutlined
} from '@ant-design/icons';
import { IconFont } from '../IconFont';
import cutin from '@/assets/images/cutin.svg';
import './index.scss';

interface MidCardProps {
	color?: string;
	icon?: string;
	title?: string;
	status?: number;
	leftText?: string | '安装';
	rightText?: string | '接入';
	leftClass?: string | undefined;
	rightClass?: string | undefined;
	centerClass?: string | undefined;
	leftHandle?: () => void;
	rightHandle?: () => void;
	centerText?: string;
	centerHandle?: () => void;
	actionCount: number;
	centerStyle?: any;
	addTitle?: string;
	titleStyle?: any;
	createTime: string | null;
	onRefresh?: () => void;
	seconds: number;
	onClick?: () => void;
}
export const iconRender = (status: number | undefined) => {
	switch (status) {
		case 1:
			return (
				<>
					<img src={cutin} /> 已接入
				</>
			);
		case 3:
			return (
				<>
					<CheckCircleFilled style={{ color: '#00A700' }} /> 运行正常
				</>
			);
		case 4:
			return (
				<>
					<CloseCircleFilled style={{ color: '#C80000' }} /> 运行异常
				</>
			);
		case 6:
			return (
				<>
					<CloseCircleFilled style={{ color: '#C80000' }} /> 安装异常
				</>
			);
		case 7:
			return (
				<>
					<ExclamationCircleFilled style={{ color: '#faad14' }} />{' '}
					未配置
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
		leftClass,
		rightClass,
		centerClass,
		actionCount,
		centerText,
		centerHandle,
		centerStyle,
		addTitle,
		titleStyle,
		onRefresh,
		createTime,
		seconds,
		onClick
	} = props;
	const [borderColor, setBorderColor] = useState<string>('#E9E9E9');
	const [titleColor, setTitleColor] = useState<string>('#333333');
	const [textColor, setTextColor] = useState<string>('#878787');
	const [countDown, setCountDown] = useState<number>(-1);
	const [time, setTime] = useState<number>(0);
	useEffect(() => {
		if (seconds !== 0 && status === 2) {
			const msToSecond = Math.floor(seconds / 1000);
			setCountDown(60 - msToSecond);
		} else {
			setCountDown(-1);
		}
	}, [props]);
	useEffect(() => {
		setTime(countDown);
	}, [countDown]);
	useEffect(() => {
		let timer: any = null;
		if (countDown !== -1) {
			let count = time;
			timer = setInterval(() => {
				if (count === -1) {
					clearInterval(timer);
					timer = null;
					onRefresh && onRefresh();
				} else {
					setTime(count--);
				}
			}, 800);
		}
		return () => {
			clearInterval(timer);
		};
	}, [time]);
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
			<div className="mid-card-display" onClick={onClick}>
				{status === -1 && (
					<div className="mid-card-add" style={{ color: titleColor }}>
						<PlusOutlined style={{ marginRight: 4 }} />
						{addTitle}
					</div>
				)}
				{status !== -1 && (
					<>
						<div
							className="mid-card-icon"
							style={{ backgroundColor: color }}
						>
							<IconFont
								type={icon as string}
								style={{
									color: '#FFFFFF',
									width: 40,
									fontSize: 40
								}}
							/>
						</div>
						<div className="mid-card-title">
							<div
								title={title}
								className="text-overflow-2"
								style={titleStyle}
							>
								{title}
							</div>
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
						className={`mid-card-left ${leftClass}`}
						onClick={leftHandle}
						style={
							status === -1
								? { borderRight: `1px solid ${borderColor}` }
								: {}
						}
					>
						{leftText}
					</div>
					<div
						className={`mid-card-right ${rightClass}`}
						onClick={rightHandle}
					>
						{rightText}
					</div>
				</div>
			)}
			{actionCount === 1 && (
				<div
					className={`mid-card-center ${centerClass}`}
					onClick={centerHandle}
					style={centerStyle}
				>
					{`${centerText}` +
						`${countDown !== -1 ? `(${time}s)...` : ''}`}
				</div>
			)}
		</div>
	);
};
export default MidCard;
