import { TableProps } from 'antd/lib/table/Table';
import React, { ReactChild } from 'react';

export interface ProTableProps<RecordType> extends TableProps<RecordType> {
	showColumnSetting?: boolean;
	showRefresh?: boolean;
	onRefresh?: () => void;
	operation?: {
		primary?: React.ReactNode;
		secondary?: React.ReactNode;
	};
}
