import React, { useEffect, useState } from 'react';
import {
	Form,
	Input,
	Button,
	Field,
	Grid,
	Message,
	Icon,
	Switch,
	Balloon
} from '@alicloud/console-components';
import LDAP from '@/assets/images/LDAP.svg';
import { getLDAP, enableLDAP, disableLDAP, checkLDAP } from '@/services/user';
import messageConfig from '@/components/messageConfig';
import storage from '@/utils/storage';

const { Row, Col } = Grid;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};

function OpenCenter(props: { activeKey: string | number }) {
	const field = Field.useField();
	const { activeKey } = props;

	const [btnStatus, setBtnStatus] = useState<boolean>(true);
	const [connect, setConnect] = useState<string>('');
	const [show, setShow] = useState<boolean>(true);
	const [formShow, setFormShow] = useState<boolean>(true);

	useEffect(() => {
		activeKey === 'openCenter' && getMailInfoData();
	}, [activeKey]);

	const getMailInfoData = () => {
		getLDAP().then(async (res) => {
			if (!res.data) return;
			await field.setValues(res.data);
			checkBtn();
			res.data.isOn ? setFormShow(true) : setFormShow(false);
		});
	};

	const submit = () => {
		field.validate((errors, values) => {
			if (errors) return;
			enableLDAP({ ...values, isOn: '1' }).then((res) => {
				if (res.success) {
					Message.show(messageConfig('success', '成功', '保存成功'));
					getMailInfoData();
					storage.setLocal('isLDAP', true);
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
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
			...field.getValues()
		};
		const arr = [];
		for (const key in obj) {
			key !== 'id' && key !== 'isOn' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const testMail = () => {
		const data: any = field.getValues();
		delete data.isOn;
		delete data.id;
		checkLDAP(data).then((res) => {
			if (res.data) {
				Message.show(messageConfig('success', '成功', '测试完成'));
			}
			res.success ? setConnect('good') : setConnect('bad');
		});
	};

	const changeLDAP = (value: any) => {
		if (formShow) {
			disableLDAP().then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', 'LDAP已关闭')
					);
					setFormShow(value);
					storage.setLocal('isLDAP', false);
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
				}
			});
		} else {
			checkBtn();
			field.validate((errors, values) => {
				if (!errors) {
					enableLDAP({ ...values, isOn: '1' }).then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', 'LDAP已启用')
							);
							setFormShow(value);
							storage.setLocal('isLDAP', true);
						} else {
							Message.show(
								messageConfig('error', '失败', res.errorMsg)
							);
						}
					});
				} else {
					setFormShow(value);
				}
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
							<Icon
								type={
									show
										? 'angle-double-up'
										: 'angle-double-down'
								}
								size="xs"
								style={{ color: '#C0C6CC' }}
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
									<Balloon
										trigger={
											<Icon
												type="question-circle"
												size="xs"
											/>
										}
										closable={false}
									>
										开启LDAP认证会自动禁用系统当前的用户系统，取而代之的是利用对接的LDAP服务器来做用户的登录认证
									</Balloon>
								</label>
								<Switch
									checked={formShow}
									onChange={changeLDAP}
								/>
							</div>
							<Form
								field={field}
								{...formItemLayout}
								style={{
									padding: '24px',
									display: formShow ? 'block' : 'none'
								}}
							>
								<Form.Item
									required
									label="服务器地址"
									style={{ position: 'relative' }}
								>
									<Input
										placeholder="请输入内容"
										name="ip"
										onChange={checkBtn}
									/>
									{connect && (
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
									)}
								</Form.Item>
								<Form.Item required label="端口">
									<Input
										placeholder="请输入内容"
										name="port"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="基准DN">
									<Input
										placeholder="请输入内容"
										name="base"
										onChange={checkBtn}
										onBlur={(e) =>
											field.setValues({
												mailPath: e.target.value
											})
										}
									/>
								</Form.Item>
								<Form.Item required label="管理DN">
									<Input
										placeholder="请输入内容"
										name="userdn"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="密码">
									<Input.Password
										placeholder="请输入内容"
										name="password"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="用户属性名">
									<Input
										placeholder="请输入内容"
										name="searchAttribute"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="过滤条件">
									<Input
										placeholder="请输入内容"
										name="objectClass"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="用户姓名的属性名">
									<Input
										placeholder="请输入内容"
										name="displayNameAttribute"
										onChange={checkBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											field.reset();
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
