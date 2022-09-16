import React, { useState } from 'react';
import { Modal } from 'antd';
import { ColumnsModalProps } from './table';
import ColumnsCheck from './columnsCheck';
import { ColumnsType } from 'antd/lib/table/interface';

function ColumnsModal<T>(props: ColumnsModalProps<T>): JSX.Element {
	const { visible, onOk, onCancel, columns, defaultColumns } = props;
	const [checked, setChecked] = useState<ColumnsType<T>>(defaultColumns);
	const handleOk = () => {
		onOk(checked);
	};
	const onChange = (value: ColumnsType<T>) => {
		setChecked(value);
	};
	return (
		<Modal
			title="表格列设置"
			visible={visible}
			onOk={handleOk}
			onCancel={onCancel}
			okText="确认"
			cancelText="取消"
		>
			<ColumnsCheck
				columns={columns}
				checked={defaultColumns}
				onChange={onChange}
			/>
		</Modal>
	);
}
export default ColumnsModal;
