import React, { useState } from 'react';
import { Modal, Form, Select, Radio, Row, Col } from 'antd';
import { formItemLayout618 } from '@/utils/const';
interface AuthorizationFormProps {
	open: boolean;
	onCancel: () => void;
	type: string;
}
const radiosOptions = [
	{ label: '只读', value: 'Apple' },
	{ label: '管理', value: 'Pear' },
	{ label: '读写', value: 'Orange' }
];
const mysqlOptions = [
	{ value: 'database', label: '数据库' },
	{ value: 'table', label: '数据表' }
];
const pgsqlOptions = [
	{ value: 'database', label: '数据库' },
	{ value: 'table', label: '数据表' },
	{ value: 'mode', label: '模式' }
];
const redisOptions = [
	{ value: 'database', label: '数据库' },
	{ value: 'key', label: 'key' }
];
function returnOptionsByType(type: string) {
	switch (type) {
		case 'mysql':
			return mysqlOptions;
		case 'postgresql':
			return pgsqlOptions;
		case 'redis':
			return redisOptions;
		default:
			return mysqlOptions;
	}
}
export default function AuthorizationForm(
	props: AuthorizationFormProps
): JSX.Element {
	const [form] = Form.useForm();
	const { open, onCancel, type } = props;
	const [options] = useState(returnOptionsByType(type));
	const [authType, setAuthType] = useState<string>('database');
	const handleChange = (value: string) => setAuthType(value);
	const onOk = () => {
		console.log('click onOk');
	};
	return (
		<Modal
			title="授权"
			onCancel={onCancel}
			open={open}
			width={500}
			onOk={onOk}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="授权类型"
					name="authType"
					initialValue={authType}
					required
				>
					<Select
						options={options}
						value={authType}
						onChange={handleChange}
					/>
				</Form.Item>
				{authType === 'database' && (
					<Form.Item
						label="授权对象"
						name="authObject"
						rules={[{ required: true, message: '请选择授权对象' }]}
					>
						<Select placeholder="请选择授权对象" options={[]} />
					</Form.Item>
				)}
				{authType === 'table' && type === 'mysql' && (
					<Form.Item label="授权对象" name="auth">
						<Row>
							<Col span={12}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择数据库'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										options={[]}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									name="authObject"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select
										placeholder="请选择授权对象"
										options={[]}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
				)}
				{authType === 'mode' && (
					<Form.Item label="授权对象" name="auth">
						<Row>
							<Col span={12}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择数据库'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										options={[]}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									name="authObject"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select
										placeholder="请选择授权对象"
										options={[]}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
				)}
				{authType === 'table' && type === 'postgresql' && (
					<Form.Item label="授权对象" name="auth">
						<Row>
							<Col span={8}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择数据库'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										options={[]}
									/>
								</Form.Item>
							</Col>
							<Col span={8}>
								<Form.Item
									name="mode"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择模式'
										}
									]}
								>
									<Select
										placeholder="请选择模式"
										options={[]}
									/>
								</Form.Item>
							</Col>
							<Col span={8}>
								<Form.Item
									name="authObject"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select
										placeholder="请选择授权对象"
										options={[]}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
				)}
				{authType === 'key' && (
					<Form.Item label="授权对象" name="auth">
						<Row>
							<Col span={12}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择模式'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										options={[]}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									name="authObject"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select
										placeholder="请选择授权对象"
										options={[]}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
				)}
				<Form.Item
					label="授权设置"
					name="authSetting"
					rules={[{ required: true, message: '请选择权限' }]}
				>
					<Radio.Group options={radiosOptions} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
