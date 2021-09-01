import React from 'react';
import { Radio } from '@alicloud/console-components';

const { Group: RadioGroup } = Radio;
/**
 *
 * @param { id, onCallBack, columns, dataList } props
 * id 一项数据的唯一id
 */
interface tableRadioProps {
	id: string | number | boolean;
	onCallBack: (value: string | number | boolean) => void;
	columns: columnProps[];
	dataList: any[];
}
interface columnProps {
	title: string;
	dataIndex: string;
}
export default function TableRadio(props: tableRadioProps): JSX.Element {
	const { id = '', onCallBack, columns = [], dataList = [] } = props;
	return (
		<div style={{ width: '100%' }}>
			<RadioGroup
				value={id}
				onChange={(value) => onCallBack(value)}
				style={{ width: '100%' }}
			>
				<table className="table-list">
					<thead>
						<tr>
							{columns.map((column, index) => {
								return <th key={index}>{column.title}</th>;
							})}
						</tr>
					</thead>
					<tbody>
						{dataList.length > 0 &&
							dataList.map((data, indexData) => {
								return (
									<tr key={indexData}>
										{columns.map((column, indexColumn) => {
											if (column.dataIndex === 'id') {
												return (
													<td key={indexColumn}>
														<Radio
															id={data.id}
															value={data.id}
														/>
													</td>
												);
											} else
												return (
													<td key={indexColumn}>
														{data[column.dataIndex]}
													</td>
												);
										})}
									</tr>
								);
							})}
					</tbody>
				</table>
				{dataList.length === 0 && (
					<div style={{ textAlign: 'center' }}>
						暂无可选的备份数据
					</div>
				)}
			</RadioGroup>
		</div>
	);
}
