import React from 'react';

export interface TimeSelectProps {
	timeSelect: (value: any) => void;
	source: string;
	style: React.CSSProperties;
}
