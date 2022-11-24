import { formItemLayout618 } from '@/utils/const';
import { Checkbox, Form, Input, Modal, notification, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { getList } from '@/services/serviceList';
import { authLogin } from '@/services/operatorPanel';
import { LoginConsoleProps } from '../index.d';
import {
	serviceListItemProps,
	serviceProps
} from '@/pages/ServiceList/service.list';
import { encrypt, decrypt } from '@/utils/utils';
import storage from '@/utils/storage';
import { getRsaKey } from '@/services/user';
const { Option } = Select;
// ! 运维面板所有相关存储都存在sessionStorage中
export default function LoginConsole(props: LoginConsoleProps): JSX.Element {
	const {
		open,
		onCancel,
		projectId,
		clusterId,
		namespace,
		middlewareName,
		middlewareType,
		version,
		onCreate
	} = props;
	const [form] = Form.useForm();
	const [data, setData] = useState<serviceListItemProps>();
	const [cookie, setCookie, removeCookie] = useCookies([
		'username',
		'password'
	]);
	useEffect(() => {
		getList({
			projectId: projectId,
			clusterId: clusterId,
			namespace: namespace,
			type: middlewareType,
			keyword: ''
		}).then((res) => {
			if (res.success) {
				setData(res.data[0]);
			}
		});
		getRsaKey().then((res) => {
			if (res.success) {
				const pub = `-----BEGIN PUBLIC KEY-----${res.data}-----END PUBLIC KEY-----`;
				storage.setSession('rsa', pub);
			}
		});
	}, []);
	useEffect(() => {
		if (JSON.stringify(cookie) !== '{}') {
			const privateKey = `-----BEGIN PRIVATE KEY-----
			MIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8AgEAAkEAuL9fL0j1Y+Lrx7/g
			pBEb+cUVlNj7A1rKbRMuZQWRhJdCjutGIctV1ppr8VUYTIagWfOiXADn4QzBfPG9
			23ZncwIDAQABAkEAsAGBySaUwciaH/7pIOU75cShPuFIonWIjEnN1WhsrgdeD+Mk
			iop25Z1lpd5hRcEPeo/zSJxlsk3Co82dyUzFwQIhAOOU39PeXla/hs42WKE3NKnl
			cVAnnizFq5L7xqRyT6uZAiEAz9E326GvaeyyHc6mj7NIditt8ZoFz5jMeMcAe8VQ
			MusCIQDUIO1tD+XBWC7wQanlQ478GdjADN2b//hIPhTPLZnjaQIgE8CJ85khiArU
			PxsGH8Blkb28/GqsRLf8LzqS5DCz17MCIQC9HcYDyPvumLBNcLAWs/KESkLXyj1H
			CGGvRnGJXOcC1g==
			-----END PRIVATE KEY-----`;
			console.log(cookie);

			form.setFieldsValue({
				username: cookie.username,
				password: decrypt(cookie.password, privateKey),
				remember: true
			});
		}
	}, [cookie]);
	const onFieldsChange = (changedFields: any, allFields: any) => {
		if (changedFields[0].name[0] === 'remember' && changedFields[0].value) {
			const usernameTemp = allFields.filter(
				(item: any) => item['name'][0] === 'username'
			);
			const passwordTemp = allFields.filter(
				(item: any) => item['name'][0] === 'password'
			);
			const pubKey =
				'-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALi/Xy9I9WPi68e/4KQRG/nFFZTY+wNaym0TLmUFkYSXQo7rRiHLVdaaa/FVGEyGoFnzolwA5+EMwXzxvdt2Z3MCAwEAAQ==-----END PUBLIC KEY-----';
			setCookie('username', usernameTemp[0].value, {
				path: '/'
			});
			setCookie('password', encrypt(passwordTemp[0].value, pubKey), {
				path: '/'
			});
		} else if (
			changedFields[0].name[0] === 'remember' &&
			!changedFields[0].value
		) {
			removeCookie('username');
			removeCookie('password');
		}
	};
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				middlewareName: values.middlewareName,
				type: middlewareType,
				namespace: namespace,
				username: values.username,
				password:
					encrypt(values.password, storage.getSession('rsa')) ||
					values.password
			};
			authLogin(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '登录成功'
					});
					onCreate(res.data);
				} else {
					notification.error({
						message: '失败',
						description: `${res.errorMsg}${
							res.errorDetail ? ':' + res.errorDetail : ''
						}`
					});
				}
			});
		});
	};
	return (
		<Modal title="登录控制台" open={open} onCancel={onCancel} onOk={onOk}>
			<Form
				form={form}
				{...formItemLayout618}
				labelAlign="left"
				onFieldsChange={onFieldsChange}
			>
				<Form.Item
					required
					label="实例ID"
					name="middlewareName"
					initialValue={middlewareName}
				>
					<Select>
						{data?.serviceList.map((item: serviceProps) => {
							return (
								<Option key={item.name} value={item.name}>
									{item.name}
								</Option>
							);
						})}
					</Select>
				</Form.Item>
				<Form.Item
					label="账号"
					name="username"
					rules={[{ required: true, message: '请输入账号' }]}
					initialValue={
						middlewareType === 'redis' && version === '5.0'
							? 'default'
							: ''
					}
				>
					<Input
						placeholder="请输入"
						disabled={
							middlewareType === 'redis' && version === '5.0'
						}
					/>
				</Form.Item>
				<Form.Item
					label="密码"
					name="password"
					rules={[{ required: true, message: '请输入密码' }]}
				>
					<Input.Password
						placeholder="请输入"
						onKeyDown={(e) => e.keyCode === 13 && onOk()}
						// visibilityToggle={false}
					/>
				</Form.Item>
				{/* <Form.Item
					name="remember"
					valuePropName="checked"
					wrapperCol={{ offset: 6, span: 18 }}
				>
					<Checkbox>记住密码</Checkbox>
				</Form.Item> */}
			</Form>
		</Modal>
	);
}
