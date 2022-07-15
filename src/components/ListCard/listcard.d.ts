import React from 'react';

export interface ListCardItemProps {
	label?: any;
	value?: any;
	width?: number;
	render?: any;
	style?: React.CSSProperties;
	icon?: any;
}
export interface ListCardProps {
	title: string;
	titleClick?: () => void;
	subTitle: string;
	accordion?: boolean;
	icon: any;
	content?: any;
	children: any;
	actionRender?: any;
	render?: JSX.Element;
	columnGap?: string;
}
