import React, { useState } from 'react';
import {
	Space,
	Table,
	Input,
	Radio,
	DatePicker,
	Button,
	Pagination,
	Switch
} from 'antd';
import { useHistory, useParams } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps, RadioChangeEvent } from 'antd';
import {
	CheckOutlined,
	CloseOutlined,
	ReloadOutlined
} from '@ant-design/icons';
import AddAccount from './AddAccount';
import { ParamsProps } from '../index.d';
import Actions from '@/components/Actions';
import AuthorizationForm from './AuthorizatioinForm';
const LinkButton = Actions.LinkButton;
const { Search } = Input;
const { RangePicker } = DatePicker;
interface DataType {
	id: number;
	account: string;
	auth: string;
	canAuth: boolean;
	status: boolean;
	lastTime: string;
}

export default function AccountMag(): JSX.Element {
	const history = useHistory();
	const params: ParamsProps = useParams();
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [addOpen, setAddOpen] = useState<boolean>(false);
	const [authOpen, setAuthOpen] = useState<boolean>(false);
	const [executionTime, setExecutionTime] = useState<string>('');
	const [dataSource, setDataSource] = useState([
		{
			id: 1,
			account: 'aaa',
			status: true,
			lastTime: '2022-10-09',
			auth: 'aaa',
			canAuth: true
		}
	]);
	const columns: ColumnsType<DataType> = [
		{
			title: '账号名',
			dataIndex: 'account',
			key: 'account'
		},
		{
			title: '权限',
			dataIndex: 'auth',
			key: 'auth',
			render: (_, record) => (
				<span
					className="name-link"
					onClick={() => {
						history.push(
							`/operationalPanel/${params.currentTab}/${params.type}/${params.name}/roleDetail/${record.account}`
						);
					}}
				>
					查看详情
				</span>
			)
		},
		{
			title: '能否授权',
			dataIndex: 'canAuth',
			key: 'canAuth',
			render: (text) => {
				if (text) return <CheckOutlined />;
				return <CloseOutlined />;
			}
		},
		{
			title: '启/禁用',
			dataIndex: 'status',
			key: 'status',
			render: (text) => <Switch checked={text} />
		},
		{
			title: '最后登录时间',
			dataIndex: 'lastTime',
			key: 'lastTime'
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			render: (_, record) => (
				<Actions>
					<LinkButton>编辑</LinkButton>
					<LinkButton>重置密码</LinkButton>
					<LinkButton>删除</LinkButton>
				</Actions>
			)
		}
	];
	const onSearch = (value: string) => console.log(value);
	const onRefresh = () => console.log('refresh');
	const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 条`;
	const onShowSizeChange: PaginationProps['onShowSizeChange'] = (
		current,
		pageSize
	) => {
		console.log(current, pageSize);
	};
	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrent(page);
	};
	const handleRadioChange = (e: RadioChangeEvent) => {
		setExecutionTime(e.target.value);
	};
	return (
		<main className="account-mag-main">
			<div className="account-mag-action-content">
				<Space>
					<Button type="primary" onClick={() => setAddOpen(true)}>
						新增
					</Button>
					<Button type="default" onClick={() => setAuthOpen(true)}>
						授权
					</Button>
				</Space>
			</div>
			<Search
				placeholder="请输入账号名进行搜索"
				onSearch={onSearch}
				style={{ width: 400 }}
			/>
			<div className="account-mag-filter-content">
				<Space align="center">
					<label>执行时间</label>
					<Radio.Group
						onChange={handleRadioChange}
						value={executionTime}
					>
						<Radio.Button value="1day">近1天</Radio.Button>
						<Radio.Button value="3day">近3天</Radio.Button>
						<Radio.Button value="7day">近7天</Radio.Button>
						<Radio.Button value="1month">近1月</Radio.Button>
						<Radio.Button value="custom">自定义</Radio.Button>
					</Radio.Group>
					{executionTime === 'custom' && <RangePicker />}
				</Space>
				<Button
					type="default"
					icon={<ReloadOutlined />}
					onClick={onRefresh}
				/>
			</div>
			<div className="account-mag-table-content">
				<Table
					rowKey="id"
					size="small"
					columns={columns}
					dataSource={dataSource}
					pagination={{
						size: 'small',
						current: current,
						total: total,
						pageSize: pageSize,
						onShowSizeChange: onShowSizeChange,
						onChange: onChange,
						showTotal: showTotal,
						showSizeChanger: true,
						showQuickJumper: true
					}}
				/>
			</div>
			{addOpen && (
				<AddAccount open={addOpen} onCancel={() => setAddOpen(false)} />
			)}
			{authOpen && (
				<AuthorizationForm
					open={authOpen}
					onCancel={() => setAuthOpen(false)}
					type={params.type}
				/>
			)}
		</main>
	);
}
