import React, { useEffect, useState } from 'react';
import {
	Popover,
	Switch,
	notification,
	Input,
	Button,
	Row,
	Col,
	Form
} from 'antd';
import { DoubleRightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import LDAP from '@/assets/images/LDAP.svg';
import { getLDAP, enableLDAP, disableLDAP, checkLDAP } from '@/services/user';
import storage from '@/utils/storage';
import { error } from 'console';

const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};

function OpenCenter(props: { activeKey: string | undefined }): JSX.Element {
	const { activeKey } = props;

	const [btnStatus, setBtnStatus] = useState<boolean>(true);
	const [connect, setConnect] = useState<string>('');
	const [show, setShow] = useState<boolean>(true);
	const [formShow, setFormShow] = useState<boolean>(true);
	const [form] = Form.useForm();

	useEffect(() => {
		activeKey === 'openCenter' && getMailInfoData();
	}, [activeKey]);

	const getMailInfoData = () => {
		getLDAP().then(async (res) => {
			if (!res.data) return;
			await form.setFieldsValue(res.data);
			checkBtn();
			res.data.isOn ? setFormShow(true) : setFormShow(false);
		});
	};

	const submit = () => {
		form.validateFields().then((values) => {
			enableLDAP({ ...values, isOn: '1' }).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '保存成功'
					});
					getMailInfoData();
					storage.setLocal('isLDAP', true);
				} else {
					notification.error({
						message: '成功',
						description: res.errorMsg
					});
				}
			});
		});
	};

	const checkBtn = () => {
		const obj: any = {
			ip: null,
			port: null,
			base: null,
			password: null,
			userdn: null,
			objectClass: null,
			searchAttribute: null,
			displayNameAttribute: null,
			...form.getFieldsValue()
		};
		const arr = [];
		for (const key in obj) {
			key !== 'id' && key !== 'isOn' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const testMail = () => {
		const data: any = form.getFieldsValue();
		delete data.isOn;
		delete data.id;
		checkLDAP(data).then((res) => {
			if (res.data) {
				notification.success({
					message: '成功',
					description: '测试完成'
				});
			}
			res.success ? setConnect('good') : setConnect('bad');
		});
	};

	const changeLDAP = (value: any) => {
		if (formShow) {
			disableLDAP().then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: 'LDAP已关闭'
					});
					setFormShow(value);
					storage.setLocal('isLDAP', false);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		} else {
			checkBtn();
			form.validateFields()
				.then((values) => {
					enableLDAP({ ...values, isOn: '1' }).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: 'LDAP已启用'
							});
							setFormShow(value);
							storage.setLocal('isLDAP', true);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				})
				.catch((errors) => {
					setFormShow(value);
				});
		}
	};

	return (
		<div className="alarm-set">
			<div className="box">
				<div className="box-header" onClick={() => setShow(!show)}>
					<div className="header-img">
						<img src={LDAP} />
					</div>
					<div className="header-info">
						<div>
							<span className="type">LDAP</span>
							<span
								className={formShow ? 'status' : 'status none'}
							>
								{formShow ? '已启用' : '未启用'}
							</span>
						</div>
						<p>可有效解决多系统账户对接、统一管理问题</p>
					</div>
					<div className="show-box">
						<span className="show-icon">
							<DoubleRightOutlined
								style={{
									color: '#C0C6CC',
									transform: show
										? 'rotate(90deg)'
										: 'rotate(270deg)'
								}}
							/>
						</span>
					</div>
				</div>
				<div
					className="box-content"
					style={{ display: show ? 'block' : 'none' }}
				>
					<Row>
						<Col span={13} offset={4}>
							<div
								className={`form-display ${
									!formShow ? 'padding' : ''
								}`}
							>
								<label className="form-name">
									<span style={{ marginRight: 8 }}>
										启用开关
									</span>
									<Popover content="开启LDAP认证会自动禁用系统当前的用户系统，取而代之的是利用对接的LDAP服务器来做用户的登录认证">
										<QuestionCircleOutlined />
									</Popover>
								</label>
								<Switch
									checked={formShow}
									onChange={changeLDAP}
								/>
							</div>
							<Form
								form={form}
								{...formItemLayout}
								style={{
									padding: '24px',
									display: formShow ? 'block' : 'none'
								}}
								labelAlign="left"
							>
								<Form.Item
									label="服务器地址"
									name="ip"
									rules={[
										{
											required: true,
											message: '请输入服务器地址'
										}
									]}
									style={{ position: 'relative' }}
									extra={
										connect && (
											<div className="concat">
												<span
													className={
														connect === 'good'
															? 'good'
															: 'bad'
													}
												>
													{connect === 'good'
														? '可用'
														: '不可用'}
												</span>
											</div>
										)
									}
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									name="port"
									rules={[
										{
											required: true,
											message: '请输入端口'
										}
									]}
									label="端口"
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									name="base"
									rules={[
										{
											required: true,
											message: '请输入基准DN'
										}
									]}
									label="基准DN"
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
										onBlur={(e) =>
											form.setFieldsValue({
												mailPath: e.target.value
											})
										}
									/>
								</Form.Item>
								<Form.Item
									name="userdn"
									rules={[
										{
											required: true,
											message: '请输入管理DN'
										}
									]}
									label="管理DN"
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									name="password"
									rules={[
										{
											required: true,
											message: '请输入密码'
										}
									]}
									label="密码"
								>
									<Input.Password
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									name="searchAttribute"
									rules={[
										{
											required: true,
											message: '请输入用户属性名'
										}
									]}
									label="用户属性名"
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									name="objectClass"
									rules={[
										{
											required: true,
											message: '请输入过滤条件'
										}
									]}
									label="过滤条件"
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									name="displayNameAttribute"
									rules={[
										{
											required: true,
											message: '请输入用户姓名的属性名'
										}
									]}
									label="用户姓名的属性名"
								>
									<Input
										placeholder="请输入内容"
										onChange={checkBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											form.resetFields();
											checkBtn();
											setConnect('');
										}}
									>
										重置
									</Button>
									<Button
										className={
											btnStatus
												? 'test normal'
												: 'test error'
										}
										disabled={btnStatus}
										onClick={testMail}
										type="primary"
									>
										连接测试
									</Button>
									<Button
										className={
											btnStatus
												? 'save normal'
												: 'save error'
										}
										disabled={btnStatus}
										onClick={submit}
										type="primary"
									>
										保存
									</Button>
								</div>
							</Form>
						</Col>
					</Row>
				</div>
			</div>
		</div>
	);
}

export default OpenCenter;
