import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, notification } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import DataFields from '@/components/DataFields';
import { Item } from '@/components/DataFields/dataFields';
import { EditOutlined } from '@ant-design/icons';
import { formItemLayout618 } from '@/utils/const';
import AddValue from './addValue';
import {
	saveRedisKeys,
	updateRedisValue,
	deleteRedisValue,
	updateRedisKeys
} from '@/services/operatorPanel';
import { ParamsProps, RedisKeyItem as RedisKeyItemParams } from '../../index.d';
import { useParams } from 'react-router';

const LinkButton = Actions.LinkButton;
const options = [
	{ label: 'hash', value: 'hash' },
	{ label: 'Zset', value: 'zset' },
	{ label: 'list', value: 'list' },
	{ label: 'set', value: 'set' },
	{ label: 'string', value: 'string' }
];
// TODO 编辑 value单独弹窗编辑
export default function KVHash(props: any): JSX.Element {
	const [form] = Form.useForm();
	const params: ParamsProps = useParams();
	const { data, database, onRefresh } = props;
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	const [record, setRecord] = useState<any>();
	const [editKey, setEditKey] = useState<boolean>(false);
	const [editTime, setEditTime] = useState<boolean>(false);
	const [items, setItems] = useState<Item[]>([
		{
			dataIndex: '',
			label: ''
		},
		{
			dataIndex: 'key',
			label: 'key'
		},
		{
			dataIndex: 'expiration',
			label: '超过时间'
		},
		{
			dataIndex: 'keyType',
			label: '数据类型'
		}
	]);

	const Operation = {
		primary: (
			<div>
				<Button type="primary" onClick={() => setVisible(true)}>
					新增
				</Button>
			</div>
		)
	};

	const actionRender = (value: string, record: any, index: number) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						setRecord(record);
						setVisible(true);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton onClick={() => onDelete(record)}>删除</LinkButton>
			</Actions>
		);
	};

	const editKeyHandle = (sendData: any) => {
		updateRedisKeys({
			database,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			...data,
			hashValue: null,
			...sendData
		}).then((res) => {
			if (res.success) {
				setVisible(false);
				onRefresh();
				notification.success({
					message: '成功',
					description: '修改成功'
				});
			} else {
				notification.success({
					message: '成功',
					description: res.errorMsg
				});
			}
		});
	};

	const onOk = (sendData: any) => {
		if (record) {
			updateRedisValue({
				database,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				...data,
				expiration: null,
				hashValue: { ...sendData }
			}).then((res) => {
				if (res.success) {
					setVisible(false);
					onRefresh();
					notification.success({
						message: '成功',
						description: '修改成功'
					});
				} else {
					notification.success({
						message: '成功',
						description: res.errorMsg
					});
				}
			});
		} else {
			saveRedisKeys({
				database,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				...data,
				expiration: null,
				hashValue: { ...sendData }
			}).then((res) => {
				if (res.success) {
					setEditKey(false);
					onRefresh();
					notification.success({
						message: '成功',
						description: '新增成功'
					});
				} else {
					notification.success({
						message: '成功',
						description: res.errorMsg
					});
				}
			});
		}
	};

	const onDelete = (record: any) => {
		deleteRedisValue({
			database,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			...data,
			hashValue: { ...record },
			value: record.value
		}).then((res) => {
			if (res.success) {
				onRefresh();
				notification.success({
					message: '成功',
					description: '删除成功'
				});
			} else {
				notification.success({
					message: '成功',
					description: res.errorMsg
				});
			}
		});
	};

	return (
		<>
			<div>
				<div className="title-container">
					<div className="title-content">
						<div className="blue-line"></div>
						<div className="detail-title mr-8">基本信息</div>
						{/* <EditOutlined
						onClick={() => setIsEdit(!isEdit)}
						style={{
							cursor: 'pointer',
							color: '#226ee7',
							fontSize: 14
						}}
					/> */}
					</div>
					<Button
						onClick={onRefresh}
						style={{ padding: '0 9px', marginRight: '8px' }}
					>
						<ReloadOutlined />
					</Button>
				</div>
			</div>
			{/* <DataFields dataSource={{}} items={items} /> */}
			<div className="data-items">
				<div className="data-item item-width">
					<span className="label-item">key:</span>
					{editKey ? (
						<Form form={form}>
							<Form.Item name="key" initialValue={data.key}>
								<Input placeholder="请输入" />
							</Form.Item>
							<Button
								type="link"
								onClick={() =>
									editKeyHandle(form.getFieldsValue())
								}
							>
								保存
							</Button>
							<Button
								type="text"
								onClick={() => setEditKey(false)}
							>
								取消
							</Button>
						</Form>
					) : (
						<div title={data.key || '/'}>
							{data.key || '/'}
							<EditOutlined
								style={{
									marginLeft: 8,
									cursor: 'pointer',
									fontSize: 14,
									color: '#226ee7',
									verticalAlign: 'middle'
								}}
								onClick={() => setEditKey(true)}
							/>
						</div>
					)}
				</div>
				<div className="data-item item-width">
					<span className="label-item">超出时间:</span>
					{editTime ? (
						<Form form={form}>
							<Form.Item name="description">
								<InputNumber placeholder="请输入" />
							</Form.Item>
							<Button type="link">保存</Button>
							<Button
								type="text"
								onClick={() => setEditTime(false)}
							>
								取消
							</Button>
						</Form>
					) : (
						<div title={data.expiration || '--'}>
							{data.expiration || '--'}
							<EditOutlined
								style={{
									marginLeft: 8,
									cursor: 'pointer',
									fontSize: 14,
									color: '#226ee7',
									verticalAlign: 'middle'
								}}
								onClick={() => setEditTime(true)}
							/>
						</div>
					)}
				</div>
			</div>
			<div className="data-item item-width mb">
				<span className="label-item">数据类型:</span>
				<div title={data.keyType || '--'}>{data.keyType || '--'}</div>
			</div>
			<ProTable
				dataSource={data.hashValue || []}
				showRefresh
				showColumnSetting
				onRefresh={onRefresh}
				rowKey="field"
				operation={Operation}
				// pagination={{
				// 	total: total,
				// 	current: current,
				// 	pageSize: pageSize
				// }}
				// onChange={onTableChange}
			>
				<ProTable.Column
					title="序号"
					dataIndex="index"
					render={(value: string, record: any, index: number) =>
						index + 1
					}
				/>
				<ProTable.Column title="field" dataIndex="field" />
				<ProTable.Column title="value" dataIndex="value" />
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
				/>
			</ProTable>
			{visible && (
				<AddValue
					type={data.keyType}
					onOk={onOk}
					visible={visible}
					data={record}
					onCancel={() => setVisible(false)}
				/>
			)}
			{/* {!isEdit && <DataFields dataSource={{}} items={items} />}
			{isEdit && (
				<Form
					style={{ width: '70%' }}
					form={form}
					{...formItemLayout618}
					labelAlign="left"
				>
					<Form.Item name="key" label="key">
						<Input placeholder="请输入" />
					</Form.Item>
					<Form.Item name="keyType" label="数据类型">
						<Select options={options} />
					</Form.Item>
					<Form.Item name="expiration" label="超过时间">
						<InputNumber
							placeholder="请输入"
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Form>
			)} */}
		</>
	);
}
