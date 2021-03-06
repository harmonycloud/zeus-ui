import React, { useState, useEffect } from 'react';
import { ProPage, ProContent } from '@/components/ProPage';
import { DatePicker } from 'antd';
import moment from 'moment';
import ProTable from '@/components/ProTable';
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
	const onChange = (val: any) => {
		if (val) {
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
		} else {
			getData(clusterId, namespace, middlewareName, type, searchText);
		}
	};

	const Operation = {
		primary: <RangePicker onChange={onChange} />
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
		return value ? '???' : '???';
	};

	return (
		<ProPage>
			<ProContent style={{ padding: '0 0' }}>
				<ProTable
					dataSource={dataSource}
					rowKey="id"
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
						onChange: (value) => setSearchText(value.target.value),
						placeholder: '????????????????????????'
					}}
				>
					<ProTable.Column
						title="?????????"
						dataIndex="item"
						width={210}
						fixed="left"
					/>
					<ProTable.Column
						title="?????????????????????"
						dataIndex="last"
						width={210}
					/>
					<ProTable.Column
						title="?????????????????????"
						dataIndex="after"
						width={210}
					/>
					<ProTable.Column
						title="????????????"
						dataIndex="status"
						render={statusRender}
					/>
					<ProTable.Column
						title="????????????"
						dataIndex="date"
						render={dateRender}
					/>
				</ProTable>
			</ProContent>
		</ProPage>
	);
}
