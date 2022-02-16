import React from 'react';
export interface formBlockProps {
	title: string | JSX.Element;
	className?: string;
	style?: React.CSSProperties;
	children: any;
}
