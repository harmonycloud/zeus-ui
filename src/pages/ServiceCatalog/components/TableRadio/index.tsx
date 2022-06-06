import React from 'react';
import { Radio, RadioChangeEvent, Space } from 'antd';
import { TableRadioProps } from './tableRadio';

/**
 *
 * @param { id, isMysql, onCallBack } props
 * id 一项数据的唯一id
 */
export default function TableRadio(props: TableRadioProps): JSX.Element {
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
			<table className="table-list">
				<thead>
					<tr>
						<th>
							{columns.map((column, index) => {
								if (column.dataIndex !== 'id') {
									return (
										<span
											style={{
												width: isMysql
													? '22.6%'
													: '30%',
												marginLeft: index === 1 ? 35 : 0
											}}
											key={index}
										>
											{column.title}
										</span>
									);
								}
							})}
						</th>
					</tr>
				</thead>
				<tbody>
					<Radio.Group
						value={id}
						onChange={(e: RadioChangeEvent) => {
							onCallBack(e.target.id as unknown as string);
						}}
						style={{ width: '100%' }}
					>
						<Space
							direction="vertical"
							style={{ width: '100%', gap: '0px' }}
						>
							{dataList.map((data, indexData) => {
								return (
									<Radio
										key={indexData}
										id={data.id}
										value={data.id}
									>
										<tr>
											{columns.map(
												(column, indexColumn) => {
													if (
														column.dataIndex !==
														'id'
													) {
														return (
															<span
																key={
																	indexColumn
																}
																style={
																	!isMysql
																		? {
																				width: '33% !important'
																		  }
																		: {}
																}
															>
																{
																	data[
																		column
																			.dataIndex
																	]
																}
															</span>
														);
													} else {
														return (
															<span
																key={
																	indexColumn
																}
															></span>
														);
													}
												}
											)}
										</tr>
									</Radio>
								);
							})}
						</Space>
					</Radio.Group>
				</tbody>
			</table>
		</div>
	);
}
