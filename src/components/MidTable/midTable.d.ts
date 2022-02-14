import React from 'react';
export interface ColumnDialogProps {
	visible: boolean;
	columns: any[];
	defaultSelected: any[];
	onConfirm: (value: any) => void;
	onCancel: () => void;
}
export interface ColumnListProps {
	columns: any[];
	onChange: (value: any) => void;
	checked: any[];
}
export interface MidTableProps {
	columns?: any[];
	children: any;
	dataSource: any[];
	operation?: any;
	showColumnSetting?: boolean;
	showRefresh?: boolean;
	pagination?: any;
	onRefresh?: () => void;
	searchStyle?: React.CSSProperties;
	[propsName: string]: any;
}
