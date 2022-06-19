import React from 'react';

export interface ProListProps {
	children: any;
	operation?: {
		primary?: React.ReactNode;
		secondary?: React.ReactNode;
	};
	search?: SearchProps | null;
	showRefresh?: boolean;
	onRefresh?: () => void;
	refreshDisabled?: boolean;
}
