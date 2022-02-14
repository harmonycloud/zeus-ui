import React from 'react';
import { Checkbox } from '@alicloud/console-components';
import { ColumnListProps } from './midTable';
import './columnList.scss';

const Group = Checkbox.Group;

const ColumnList: (props: ColumnListProps) => JSX.Element = (props) => {
	const { columns = [], onChange, checked } = props;
	const handleChange = (values: string[]) => {
		onChange &&
			onChange(
				columns.filter((item: any) => values.includes(item.title))
			);
	};
	return (
		<Group
			className="column-list"
			onChange={handleChange}
			defaultValue={checked.map((it: any) => it.title)}
		>
			{columns.map((item: any, i: number) => (
				<Checkbox key={i} value={item.title}>
					{item.title}
				</Checkbox>
			))}
		</Group>
	);
};

export default ColumnList;
