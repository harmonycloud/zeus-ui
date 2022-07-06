import React, { useState } from 'react';
import { Checkbox, Row, Col } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { ColumnsCheckProps } from './table';
import { ColumnsType, ColumnType } from 'antd/lib/table/interface';

function ColumnsCheck<T>(props: ColumnsCheckProps<T>): JSX.Element {
	const { checked, columns, onChange } = props;
	const [defaultValue] = useState<string[]>(
		checked.map((item) => item.title as string)
	);
	const handleChange = (checkedValue: CheckboxValueType[]) => {
		let list: ColumnsType<T> = [];
		list = columns.filter((item: ColumnType<T>) =>
			checkedValue.includes(item.title as string)
		);
		onChange(list);
	};
	return (
		<Checkbox.Group defaultValue={defaultValue} onChange={handleChange}>
			<Row>
				{columns.map((item: any, index: number) => {
					return (
						<Col span={8} key={index}>
							<Checkbox value={item.title}>{item.title}</Checkbox>
						</Col>
					);
				})}
			</Row>
		</Checkbox.Group>
	);
}
export default ColumnsCheck;
