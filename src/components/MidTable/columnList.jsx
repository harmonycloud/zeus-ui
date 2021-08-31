import { Checkbox } from '@alicloud/console-components';
import React from 'react';
import './columnList.scss';

const Group = Checkbox.Group;

const ColumnList = (props) => {
	const { columns = [], onChange, checked } = props;
	const handleChange = (values) => {
		// values.forEach(item=>item)
		onChange &&
			onChange(columns.filter((item) => values.includes(item.title)));
	};
	return (
		<Group
			className="column-list"
			onChange={handleChange}
			defaultValue={checked.map((it) => it.title)}
		>
			{columns.map((item, i) => (
				<Checkbox key={i} value={item.title}>
					{item.title}
				</Checkbox>
			))}
		</Group>
	);
};

export default ColumnList;
