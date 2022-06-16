import React from 'react';

export interface ListCardItemProps {
	label?: any;
	value?: any;
	width?: number;
	render?: any;
}
export interface ListCardProps {
	title: string;
	subTitle: string;
	accordion?: boolean;
	icon: any;
	content?: any;
	children: any;
	actionRender?: any;
}
