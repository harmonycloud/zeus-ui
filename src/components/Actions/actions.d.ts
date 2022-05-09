import React from 'react';

export interface LinkButtonProps {
	disabled?: boolean;
	children: React.ReactNode;
	onClick?: () => void;
	style?: React.CSSProperties;
}
export interface ActionsProps {
	children: React.ReactNode[] | React.ReactNode;
	threshold?: number;
}
