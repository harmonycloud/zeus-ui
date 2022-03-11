import React, { useEffect, useState } from 'react';
import {
	Form,
	Input,
	Button,
	Field,
	Grid,
	Message,
	Icon
} from '@alicloud/console-components';
import LDAP from '@/assets/images/LDAP.svg';
import {
	getMailInfo,
	setMail,
	connectMail
} from '@/services/alarm';
import messageConfig from '@/components/messageConfig';

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
	const [data, setData] = useState();
	const [connect, setConnect] = useState<string>('');
	const [show, setShow] = useState<boolean>(true);

	useEffect(() => {
		activeKey === 'openCenter' && getMailInfoData();
	}, [activeKey]);

	const getMailInfoData = () => {
		// getMailInfo().then(async (res) => {
		// 	if (!res.data) return;
		// 	await field.setValues(res.data);
		// 	checkBtn();
		// 	setData(res.data);
		// });
	};

	const submit = () => {
		field.validate((error, value) => {
			if (error) return;
			setMail(value).then((res) => {
				if (res.data) return;
				getMailInfoData();
				Message.show(messageConfig('success', '成功', '邮箱设置成功'));
			});
		});
	};

	const checkBtn = () => {
		const obj: any = {
			port: null,
			password: null,
			mailPath: null,
			mailServer: null,
			userName: null,
			...field.getValues()
		};
		const arr = [];
		for (const key in obj) {
			key !== 'time' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const testMail = () => {
		const data: any = field.getValues();
		const sendData = {
			email: data.userName,
			password: data.password
		};
		connectMail(sendData).then((res) => {
			if (res.data) {
				Message.show(messageConfig('success', '成功', '测试完成'));
			}
			res.data ? setConnect('good') : setConnect('bad');
		});
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
							<span className={data ? 'status' : 'status none'}>
								{data ? '已启用' : '未启用'}
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
							<Form
								field={field}
								{...formItemLayout}
								style={{ padding: '24px' }}
							>
								<Form.Item
									required
									label="服务器地址"
									style={{ position: 'relative' }}
								>
									<Input
										placeholder="请输入内容"
										name="mailServer"
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
										name="userName"
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
										name="password"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="密码">
									<Input.Password
										placeholder="请输入内容"
										name="mailPath"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="用户属性名">
									<Input
										placeholder="请输入内容"
										name="mailPath"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="过滤条件">
									<Input
										placeholder="请输入内容"
										name="mailPath"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="用户姓名的属性名">
									<Input
										placeholder="请输入内容"
										name="mailPath"
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
