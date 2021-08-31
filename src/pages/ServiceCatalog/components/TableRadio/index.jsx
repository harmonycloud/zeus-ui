import React from 'react';
import { Radio } from '@alicloud/console-components';

const { Group: RadioGroup } = Radio;
/**
 *
 * @param { id, isMysql, onCallBack } props
 * id 一项数据的唯一id
 */
export default function TableRadio(props) {
	const { id = '', isMysql = false, onCallBack } = props;
	const columns = [
		{ title: '', dataIndex: 'id' },
		{ title: '规格', dataIndex: 'spec' },
		{ title: 'CPU', dataIndex: 'cpu' },
		{ title: '内存', dataIndex: 'memory' }
	];
	if (isMysql) {
		columns.push({ title: '推荐连接数', dataIndex: 'num' });
	}
	const dataList = [
		{
			id: '1',
			spec: '基本性能',
			cpu: '1 Core',
			memory: '2 Gi',
			num: '600'
		},
		{
			id: '2',
			spec: '一般性能',
			cpu: '2 Core',
			memory: '8 Gi',
			num: '2000'
		},
		{
			id: '3',
			spec: '较强性能',
			cpu: '4 Core',
			memory: '16 Gi',
			num: '4000'
		},
		{
			id: '4',
			spec: '高强性能',
			cpu: '8 Core',
			memory: '32 Gi',
			num: '8000'
		},
		{
			id: '5',
			spec: '超强性能',
			cpu: '16 Core',
			memory: '64 Gi',
			num: '16000'
		}
	];

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
						{dataList.map((data, indexData) => {
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
			</RadioGroup>
		</div>
	);
}
