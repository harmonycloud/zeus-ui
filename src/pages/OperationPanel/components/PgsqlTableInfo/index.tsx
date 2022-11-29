import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
	Button,
	Divider,
	Form,
	Input,
	InputNumber,
	notification,
	Select,
	Space
} from 'antd';
import { formItemLayout618 } from '@/utils/const';
import {
	ParamsProps,
	PgsqlTableInfoProps,
	PgsqlUserItem,
	SchemaItem
} from '../../index.d';
import {
	getSchemas,
	getUsers,
	updatePgsqlInfo
} from '@/services/operatorPanel';

const tableSpaceOptions = [
	{ label: 'pg_default', value: 'pg_default' },
	{ label: 'pg_global', value: 'pg_global' }
];
const { Option } = Select;
export default function PgsqlTableInfo(
	props: PgsqlTableInfoProps
): JSX.Element {
	const {
		handleChange,
		dbName,
		data,
		schemaName,
		tableName,
		clusterId,
		namespace,
		middlewareName,
		removeActiveKey,
		cancel
	} = props;
	const [form] = Form.useForm();
	const params: ParamsProps = useParams();
	const [schemas, setSchemas] = useState<SchemaItem[]>([]);
	const [users, setUsers] = useState<PgsqlUserItem[]>([]);
	useEffect(() => {
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
		if (dbName) {
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
		}
	}, [dbName]);
	useEffect(() => {
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
	const save = () => {
		if (tableName && data) {
			updatePgsqlInfo({
				oid: data.oid,
				databaseName: dbName,
				table: tableName,
				schema: schemaName,
				clusterId,
				namespace,
				middlewareName,
				tableName: data.tableName,
				owner: data.owner,
				schemaName: data.schemaName,
				tablespace: data.tablespace,
				fillFactor: data.fillFactor,
				description: data.description
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '基本信息修改成功!'
					});
					removeActiveKey();
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		}
	};
	return (
		<>
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
					rules={[{ required: true, message: '请输入表名' }]}
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
				<Form.Item
					label="模式"
					name="schemaName"
					initialValue={schemaName}
				>
					<Select placeholder="请选择模式">
						{schemas.map((item: SchemaItem) => (
							<Option
								key={item.schemaName}
								value={item.schemaName}
							>
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
				<Form.Item
					label="备注"
					name="description"
					rules={[
						{
							type: 'string',
							max: 128,
							message:
								'请输入中英文字符数字及特殊字符组成的1-128个字符'
						}
					]}
				>
					<Input.TextArea placeholder="请输入" rows={3} />
				</Form.Item>
			</Form>
			{tableName && (
				<>
					<Divider />
					<Space>
						<Button type="primary" onClick={save}>
							保存
						</Button>
						<Button onClick={cancel}>取消</Button>
					</Space>
				</>
			)}
		</>
	);
}
