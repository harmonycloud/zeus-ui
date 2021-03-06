import React from 'react';
import { SearchProps } from 'antd/lib/input';
import { ColumnsType, ColumnType } from 'antd/lib/table/interface';
import { TableProps } from 'antd/lib/table/Table';

export interface ProTableProps<RecordType> extends TableProps<RecordType> {
	showColumnSetting?: boolean;
	showRefresh?: boolean;
	refreshDisabled?: boolean;
	onRefresh?: () => void;
	operation?: {
		primary?: React.ReactNode;
		secondary?: React.ReactNode;
	};
	search?: SearchProps | null;
	children: React.ReactNode[];
	style?: React.CSSProperties;
}

export interface ColumnsModalProps<T> {
	visible: boolean;
	columns: ColumnsType<T>;
	defaultColumns: ColumnsType<T>;
	onOk: (value: ColumnsType<T>) => void;
	onCancel: () => void;
}

export interface ColumnsCheckProps<T> {
	columns: ColumnsType<T>;
	checked: ColumnsType<T>;
	onChange: (value: ColumnsType<T>) => void;
}
