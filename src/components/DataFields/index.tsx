import * as React from 'react';
import { Descriptions } from 'antd';
import { Item, DataFieldsProps } from './dataFields';
import './index.scss';

function DataFields(props: DataFieldsProps): JSX.Element {
	const { dataSource, items, column, title, labelStyle, ...config } = props;
	return (
		<Descriptions
			column={column || 2}
			title={
				title ||
				(items[0].render &&
					items[0].render(
						dataSource[items[0].dataIndex || ''],
						dataSource
					))
			}
			labelStyle={labelStyle || { width: '160px' }}
			{...config}
		>
			{items.map((item: Item, index: number) => {
				if (index !== 0) {
					return (
						<Descriptions.Item
							label={
								item.label || dataSource[item.dataIndex || '']
							}
							contentStyle={item.contentStyle}
							key={item.dataIndex}
							span={item.span}
							labelStyle={item.labelStyle}
							className={item.className}
						>
							{item.render ? (
								item.render(
									dataSource[item.dataIndex || ''],
									dataSource
								)
							) : (
								<div
									className="text-overflow-one"
									title={dataSource[item.dataIndex || '']}
								>
									{dataSource[item.dataIndex || '']}
								</div>
							)}
						</Descriptions.Item>
					);
				}
			})}
		</Descriptions>
	);
}

export default DataFields;
