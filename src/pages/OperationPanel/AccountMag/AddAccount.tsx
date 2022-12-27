import React from 'react';
import { useState } from 'react';
import { Modal, Form, Input, Checkbox, notification, Tooltip } from 'antd';
import { CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import {
	AddAccountProps,
	mysqlCreateUserParamsProps,
	pgsqlCreateUserParamsProps
} from '../index.d';
import { formItemLayout618 } from '@/utils/const';
import { createUsers } from '@/services/operatorPanel';
import pattern from '@/utils/pattern';
import styles from '@/pages/ServiceCatalog/Redis/redis.module.scss';

// TODO 账号名的正则校验确认
export default function AddAccount(props: AddAccountProps): JSX.Element {
	const {
		open,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		type,
		onRefresh
	} = props;
	const [form] = Form.useForm();
	// * 密码
	const [password, setPassword] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([false, false]);
	const onOk = () => {
		form.validateFields().then((values) => {
			console.log(values);
			const mysqlSendData: mysqlCreateUserParamsProps = {
				clusterId,
				namespace,
				middlewareName,
				type,
				...values
			};
			const pgsqlSendData: pgsqlCreateUserParamsProps = {
				clusterId,
				namespace,
				middlewareName,
				type,
				username: values.user,
				password: values.password,
				inherit: values.grantAble
			};
			const sendData = type === 'mysql' ? mysqlSendData : pgsqlSendData;
			onCancel();
			createUsers(sendData)
				.then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户创建成功!'
						});
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
				})
				.finally(() => {
					onRefresh();
				});
		});
	};
	const passwordChange = (e: any) => {
		const temp = [...checks];
		if (e.target.value.length >= 8 && e.target.value.length <= 32) {
			temp[0] = true;
		} else {
			temp[0] = false;
		}
		if (
			/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,}$/.test(
				e.target.value
			)
		) {
			temp[1] = true;
		} else {
			temp[1] = false;
		}
		setChecks(temp);
		setPassword(e.target.value);
	};
	return (
		<Modal
			open={open}
			onCancel={onCancel}
			onOk={onOk}
			title="新增"
			width={500}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="账号名"
					name="user"
					rules={[{ required: true, message: '请填写账号名' }]}
				>
					<Input />
				</Form.Item>
				<Tooltip
					title={
						<ul>
							<li className={styles['edit-form-icon-style']}>
								{checks[0] ? (
									<CheckCircleFilled
										style={{
											color: '#68B642',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#Ef595C',
											marginRight: 4
										}}
									/>
								)}
								<span>(长度需要8-32之间)</span>
							</li>
							<li className={styles['edit-form-icon-style']}>
								{checks[1] ? (
									<CheckCircleFilled
										style={{
											color: '#68B642',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#Ef595C',
											marginRight: 4
										}}
									/>
								)}
								<span>
									至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
								</span>
							</li>
						</ul>
					}
				>
					<Form.Item
						label="密码"
						name="password"
						rules={[
							{ required: true, message: '请填写密码' },
							{
								pattern: new RegExp(pattern.mysqlPwd),
								message: '密码不符合要求'
							}
						]}
					>
						<Input.Password
							value={password}
							onChange={passwordChange}
						/>
					</Form.Item>
				</Tooltip>
				<Form.Item
					label="授权权限"
					name="grantAble"
					initialValue={true}
					valuePropName="checked"
				>
					<Checkbox />
				</Form.Item>
			</Form>
		</Modal>
	);
}
