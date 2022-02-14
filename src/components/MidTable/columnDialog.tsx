import React, { useState, useEffect } from 'react';
import { Dialog } from '@alicloud/console-components';
import ColumnList from './columnList';
import { ColumnDialogProps } from './midTable';

const ColumnDialog: (props: ColumnDialogProps) => JSX.Element = (
	props: ColumnDialogProps
) => {
	const {
		visible,
		columns = [],
		defaultSelected = [],
		onConfirm,
		onCancel
	} = props;
	const [checked, setChecked] = useState(defaultSelected.map((item) => item));
	useEffect(() => {
		setChecked(defaultSelected.map((item) => item));
	}, [defaultSelected]);
	const handleConfirm = () => {
		onConfirm && onConfirm(checked);
	};

	const handleCancel = () => {
		onCancel && onCancel();
	};

	return (
		<Dialog
			visible={visible}
			onOk={handleConfirm}
			onCancel={handleCancel}
			onClose={handleCancel}
			footerAlign="right"
		>
			<ColumnList
				onChange={(values) => setChecked(values)}
				checked={checked}
				columns={columns}
			></ColumnList>
		</Dialog>
	);
};

export default ColumnDialog;
