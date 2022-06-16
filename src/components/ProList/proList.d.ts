import React from 'react';

export interface ProListProps {
	children: React.ReactNode;
	operation?: {
		primary?: React.ReactNode;
		secondary?: React.ReactNode;
	};
	search?: SearchProps | null;
	showRefresh?: boolean;
	onRefresh?: () => void;
	refreshDisabled?: boolean;
}
