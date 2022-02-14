import React from 'react';
export interface HomeCardProps {
	title: string;
	style: React.CSSProperties;
	readMore: string;
	readMoreFn: () => void;
	children: any;
}
