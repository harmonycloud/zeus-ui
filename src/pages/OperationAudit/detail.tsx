import React, { useEffect, useState } from 'react';
import { Input } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { useHistory } from 'react-router-dom';
import DataFields, {
	IDataFieldsProps
} from '@alicloud/console-components-data-fields';
import Storage from '@/utils/storage';
import { auditProps } from './audit';
import moment from 'moment';

const items: IDataFieldsProps['items'] = [
	{
		dataIndex: 'title',
		render: (val) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'account',
		label: '登录账户'
	},
	{
		dataIndex: 'userName',
		label: '用户名'
	},
	{
		dataIndex: 'roleName',
		label: '角色'
	},
	{
		dataIndex: 'remoteIp',
		label: '登录IP'
	},
	{
		dataIndex: 'plate',
		label: '版块'
	},
	{
		dataIndex: 'url',
		label: '路径'
	},
	{
		dataIndex: 'requestMethod',
		label: '方法'
	},
	{
		dataIndex: 'executeTime',
		label: '耗时'
	},
	{
		dataIndex: 'status',
		label: '状态码'
	},
	{
		dataIndex: 'phone',
		label: '手机号'
	},
	{
		dataIndex: 'beginTime',
		label: '操作时间',
		render: (val) => moment(val).format('YYYY-MM-DD HH:mm:ss')
	}
];
const items2: IDataFieldsProps['items'] = [
	{
		dataIndex: 'title',
		render: (val) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'requestParams',
		label: '请求数据',
		render: (val) => (
			<Input.TextArea
				value={val}
				readOnly={true}
				autoHeight={true}
				size="large"
				style={{ width: '100%' }}
			/>
		),
		span: 24
	},
	{
		dataIndex: 'response',
		label: '返回数据',
		render: (val) => (
			<Input.TextArea
				value={val}
				readOnly={true}
				autoHeight={true}
				size="large"
				style={{ width: '100%' }}
			/>
		),
		span: 24
	}
];
export default function OperationAuditDetail(): JSX.Element {
	const history = useHistory();
	// console.log(history);
	const {
		location: { state }
	} = history;
	const [data, setData] = useState<auditProps>();
	const [basicSource, setBasicSource] = useState<
		IDataFieldsProps['dataSource']
	>({});
	const [dataSource, setDataSource] = useState<
		IDataFieldsProps['dataSource']
	>({});
	useEffect(() => {
		if (history.location.state === undefined) {
			setData(Storage.getSession('audit'));
		} else {
			setData(state as auditProps);
		}
		return () => {
			Storage.removeSession('audit');
		};
	}, []);
	useEffect(() => {
		setBasicSource({
			title: '基础信息',
			account: data?.account || '/',
			userName: data?.userName || '/',
			roleName: data?.roleName || '/',
			remoteIp: data?.remoteIp || '/',
			plate: data?.moduleChDesc + '/' + data?.childModuleChDesc,
			url: data?.url || '/',
			requestMethod: data?.requestMethod || '/',
			executeTime: `${data?.executeTime}ms` || '0ms',
			status: data?.status || '/',
			phone: data?.phone || '/',
			beginTime: data?.beginTime || '/'
		});
		setDataSource({
			title: '数据信息',
			requestParams: data?.requestParams || '/',
			response: data?.response || '/'
		});
	}, [data]);
	return (
		<Page>
			<Header
				hasBackArrow={true}
				onBackArrowClick={() => {
					history.goBack();
					Storage.removeSession('audit');
				}}
				title={`${data?.actionChDesc}（${data?.status}）`}
			></Header>
			<Content>
				<DataFields dataSource={basicSource} items={items} />
				<div className="detail-divider" />
				<DataFields dataSource={dataSource} items={items2} />
			</Content>
		</Page>
	);
}
