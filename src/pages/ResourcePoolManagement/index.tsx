import React, { useState } from 'react';
import { Button } from '@alicloud/console-components';
import { Page, Header, Content } from '@alicloud/console-components-page';
import moment from 'moment';
import Table from '@/components/MidTable';

export default function ResourcePoolManagement() {
	const [originData, setOriginData] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const getData = () => {
		console.log('get list data');
	};
	const Operation = {
		primary: (
			<Button onClick={() => console.log('aaa')} type="primary">
				添加资源池
			</Button>
		)
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = originData.filter(
				(item) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setDataSource(list);
		} else {
			setDataSource(originData);
		}
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = originData.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		}
	};
	return (
		<Page>
			<Header
				title="系统资源池"
				subTitle="发布中间件需要消耗CPU、内存等资源"
			/>
			<Content>
				<Table
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					// showRefresh
					// onRefresh={getData}
					primaryKey="key"
					operation={Operation}
					onFilter={onFilter}
					onSort={onSort}
				>
					<Table.Column title="资源池名称" dataIndex="chartName" />
					<Table.Column title="资源分区" dataIndex="chartName" />
					<Table.Column title="CPU(核)" dataIndex="chartName" />
					<Table.Column title="内存(GB)" dataIndex="chartName" />
					<Table.Column title="状态" dataIndex="chartName" />
					<Table.Column title="创建时间" dataIndex="chartName" />
					<Table.Column title="操作" dataIndex="action" />
				</Table>
			</Content>
		</Page>
	);
}
