import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Form, Input, InputNumber, Select } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import {
	ParamsProps,
	PgsqlTableInfoProps,
	PgsqlUserItem,
	SchemaItem
} from '../../index.d';
import { getSchemas, getUsers } from '@/services/operatorPanel';

const tableSpaceOptions = [
	{ label: 'pg_default', value: 'pg_default' },
	{ label: 'pg_global', value: 'pg_global' }
];
const { Option } = Select;
export default function PgsqlTableInfo(
	props: PgsqlTableInfoProps
): JSX.Element {
	const { handleChange, dbName, data } = props;
	console.log(data);
	const [form] = Form.useForm();
	const params: ParamsProps = useParams();
	const [schemas, setSchemas] = useState<SchemaItem[]>([]);
	const [users, setUsers] = useState<PgsqlUserItem[]>([]);
	useEffect(() => {
		getSchemas({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			databaseName: dbName
		}).then((res) => {
			if (res.success) {
				setSchemas(res.data);
			}
		});
		getUsers({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: 'postgresql',
			keyword: ''
		}).then((res) => {
			if (res.success) {
				setUsers(res.data as PgsqlUserItem[]);
			}
		});
	}, []);
	useEffect(() => {
		console.log(data);
		if (data) {
			form.setFieldsValue({
				tableName: data.tableName,
				owner: data.owner,
				schemaName: data.schemaName,
				tablespace: data.tablespace,
				fillFactor: data.fillFactor,
				description: data.description
			});
		}
	}, [data]);
	const onValuesChange = (changedValues: any, allValues: any) => {
		handleChange(allValues);
	};
	return (
		<Form
			style={{ width: '60%' }}
			form={form}
			labelAlign="left"
			onValuesChange={onValuesChange}
			{...formItemLayout618}
		>
			<Form.Item
				label="表名"
				name="tableName"
				rules={[
					{ required: true, message: '请输入表名' },
					{ max: 100, type: 'string', message: '表名长度不超过100' }
				]}
			>
				<Input placeholder="请输入表名" />
			</Form.Item>
			<Form.Item
				label="所有者"
				name="owner"
				rules={[{ required: true, message: '请选择所有者' }]}
			>
				<Select placeholder="请选择所有者">
					{users.map((item: PgsqlUserItem) => (
						<Option key={item.username} value={item.username}>
							{item.username}
						</Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item label="模式" name="schemaName">
				<Select placeholder="请选择模式">
					{schemas.map((item: SchemaItem) => (
						<Option key={item.schemaName} value={item.schemaName}>
							{item.schemaName}
						</Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item label="表空间" name="tablespace">
				<Select
					placeholder="请选择表空间"
					options={tableSpaceOptions}
				/>
			</Form.Item>
			<Form.Item label="填充率" name="fillFactor" initialValue={100}>
				<InputNumber style={{ width: '100%' }} />
			</Form.Item>
			<Form.Item label="备注" name="description">
				<Input.TextArea placeholder="请输入" rows={3} />
			</Form.Item>
		</Form>
	);
}
