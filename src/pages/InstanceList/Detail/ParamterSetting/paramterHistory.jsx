import React, { useState, useEffect } from 'react';
import { Page } from '@alicloud/console-components-page';
import { DatePicker } from '@alicloud/console-components';
import Table from '@/components/MidTable';
import { getConfigHistory } from '@/services/middleware';
import moment from 'moment';
import transTime from '@/utils/transTime';

const { RangePicker } = DatePicker;
export default function ParamterHistory(props) {
	const { clusterId, namespace, middlewareName, type } = props;
	const [dataSource, setDataSource] = useState([]);
	const [searchText, setSearchText] = useState();
	const [startTime, setStartTime] = useState();
	const [endTime, setEndTime] = useState();

	useEffect(() => {
		getData(clusterId, namespace, middlewareName, type, searchText);
	}, [props]);

	const getData = (
		clusterId,
		namespace,
		middlewareName,
		type,
		searchText,
		startTime = null,
		endTime = null
	) => {
		console.log(startTime, endTime);
		const sendData = {
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
			console.log(res);
			if (res.success) {
				setDataSource(res.data);
			}
		});
	};

	const onOk = (val) => {
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

	const Operation = {
		primary: <RangePicker onOk={onOk} />
	};

	const handleSearch = (value) => {
		console.log(value);
		setSearchText(value);
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

	const dateRender = (value) => {
		return transTime.gmt2local(value);
	};

	const statusRender = (value) => {
		return value ? '是' : '否';
	};

	return (
		<Page>
			<Page.Content style={{ padding: '0 0' }}>
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
						onSearch: handleSearch,
						placeholder: '请输入搜索内容'
					}}
				>
					<Table.Column title="参数名" dataIndex="item" />
					<Table.Column title="变更前的参数值" dataIndex="last" />
					<Table.Column title="变更后的参数值" dataIndex="after" />
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
			</Page.Content>
		</Page>
	);
}
