import * as React from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { useHistory } from 'react-router';
import DataFields from '@/components/DataFields';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import moment from 'antd/node_modules/moment';

const LinkButton = Actions.LinkButton;

const basicData = {
	title: '基础信息',
	name: '',
	aliasName: '',
	label: '',
	hostAffinity: '',
	chartVersion: '',
	description: '',
	annotations: '',
	tolerations: '',
	mirror: ''
};
const InfoConfig = [
	{
		dataIndex: 'title',
		render: (val: string) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'name',
		label: '状态情况'
	},
	{
		dataIndex: 'aliasName',
		label: '备份源名称',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'label',
		label: '备份方式',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'annotations',
		label: '备份位置',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'hostAffinity',
		label: '创建时间',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	}
];

const actionRender = (value: any, record: any, index: number) => {
	return (
		<Actions>
			<LinkButton>克隆服务</LinkButton>
			<LinkButton>删除</LinkButton>
		</Actions>
	);
};

function BackupTaskDetail(): JSX.Element {
	const history = useHistory();
	return (
		<ProPage>
			<ProHeader
				title="定时备份任务1（正常）"
				onBack={() => history.goBack()}
			/>
			<ProContent>
				<DataFields dataSource={basicData} items={InfoConfig} />
				<ProTable
					dataSource={[]}
					showRefresh
					// onRefresh={getData}
					rowKey="key"
				>
					<ProTable.Column title="备份记录" dataIndex="backupType" />
					<ProTable.Column
						title="备份使用量(GB)"
						dataIndex="phrase"
					/>
					<ProTable.Column
						title="备份时间"
						dataIndex="backupTime"
						sorter={(a: any, b: any) =>
							moment(a.backupTime).unix() -
							moment(b.backupTime).unix()
						}
					/>
					<ProTable.Column title="操作" render={actionRender} />
				</ProTable>
			</ProContent>
		</ProPage>
	);
}

export default BackupTaskDetail;
