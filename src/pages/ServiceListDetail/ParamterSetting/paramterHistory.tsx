import React, { useState, useEffect } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import { DatePicker } from '@alicloud/console-components';
import moment, { Moment } from 'moment';

import Table from '@/components/MidTable';
import { getConfigHistory } from '@/services/middleware';
import transTime from '@/utils/transTime';
import {
	ParamterHistoryProps,
	ParamterHistoryItem,
	ParamterHistorySendData
} from '../detail';

const { RangePicker } = DatePicker;
export default function ParamterHistory(
	props: ParamterHistoryProps
): JSX.Element {
	const { clusterId, namespace, middlewareName, type } = props;
	const [dataSource, setDataSource] = useState<ParamterHistoryItem[]>([]);
	const [searchText, setSearchText] = useState<string>('');
	const [startTime, setStartTime] = useState<string>();
	const [endTime, setEndTime] = useState<string>();

	useEffect(() => {
		if (clusterId && namespace && middlewareName && type) {
			getData(clusterId, namespace, middlewareName, type, searchText);
		}
	}, [namespace]);

	const getData = (
		clusterId: string,
		namespace: string,
		middlewareName: string,
		type: string,
		searchText: string,
		startTime: string | null = null,
		endTime: string | null = null
	) => {
		const sendData: ParamterHistorySendData = {
			clusterId,
			namespace,
			middlewareName,
			type,
			item: searchText
		};
		if (startTime && endTime) {
			sendData.startTime = moment(startTime).format(
				'YYYY-MM-DDTHH:mm:ss[Z]'
			);
			sendData.endTime = moment(endTime).format('YYYY-MM-DDTHH:mm:ss[Z]');
		}
		getConfigHistory(sendData).then((res) => {
			// console.log(res);
			if (res.success) {
				setDataSource(res.data);
			}
		});
	};

	const onOk = (val: any[]) => {
		console.log(val);
		setStartTime(val[0]);
		setEndTime(val[1]);
		const start = moment(val[0]).format('YYYY-MM-DDTHH:mm:ss[Z]');
		const end = moment(val[1]).format('YYYY-MM-DDTHH:mm:ss[Z]');
		getData(
			clusterId,
			namespace,
			middlewareName,
			type,
			searchText,
			start,
			end
		);
	};
	const onChange = (val: any[]) => {
		if (val.length === 0) {
			getData(clusterId, namespace, middlewareName, type, searchText);
		}
	};

	const Operation = {
		primary: <RangePicker onChange={onChange} onOk={onOk} />
	};
	const handleChange = (value: string) => {
		setSearchText(value);
	};
	const handleSearch = (value: string) => {
		getData(
			clusterId,
			namespace,
			middlewareName,
			type,
			value,
			startTime,
			endTime
		);
	};

	const dateRender = (value: string) => {
		return transTime.gmt2local(value);
	};

	const statusRender = (value: boolean) => {
		return value ? '是' : '否';
	};

	return (
		<Page>
			<Content style={{ padding: '0 0' }}>
				<Table
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					primaryKey="key"
					operation={Operation}
					showRefresh
					onRefresh={() =>
						getData(
							clusterId,
							namespace,
							middlewareName,
							type,
							searchText,
							startTime,
							endTime
						)
					}
					search={{
						value: searchText,
						onSearch: handleSearch,
						onChange: handleChange,
						placeholder: '请输入关键词搜索'
					}}
				>
					<Table.Column
						title="参数名"
						dataIndex="item"
						width={210}
						lock="left"
					/>
					<Table.Column
						title="变更前的参数值"
						dataIndex="last"
						width={210}
					/>
					<Table.Column
						title="变更后的参数值"
						dataIndex="after"
						width={210}
					/>
					<Table.Column
						title="是否生效"
						dataIndex="status"
						cell={statusRender}
					/>
					<Table.Column
						title="变更时间"
						dataIndex="date"
						cell={dateRender}
					/>
				</Table>
			</Content>
		</Page>
	);
}
