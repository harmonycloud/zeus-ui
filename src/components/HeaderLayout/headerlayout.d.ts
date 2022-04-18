import React from 'react';
export interface HeaderLayoutProps {
	left?: JSX.Element;
	right?: JSX.Element;
	className?: string;
	style?: React.CSSProperties;
	flex?: string[];
}
