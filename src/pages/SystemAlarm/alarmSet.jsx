import React, { useEffect, useState } from 'react';
import {
	Form,
	Input,
	Button,
	Field,
	Grid,
	Message
} from '@alicloud/console-components';
import Ding from '@/assets/images/ding.svg';
import Email from '@/assets/images/email.svg';
import { getMailInfo, setDing, setMail } from '@/services/alrem';
import messageConfig from '@/components/messageConfig';

const { Row, Col } = Grid;
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};

function AlarmSet() {
	const field = Field.useField();
	const dingField = Field.useField();
	const [btnStatus, setBtnStatus] = useState(true);
	const [dingBtnStatus, setDingBtnStatus] = useState(true);
	const [data, setData] = useState();
	const [dingData, setDingData] = useState();

	// field.validate((value, error) => {
	//     console.log(error);
	//     if (error) return;
	//     setBtnStatus(true);
	// })

	useEffect(() => {
		getMailInfo().then(async (res) => {
			if (res.code) return;
			// console.log(res);
			await field.setValues(res.data);
			checkBtn();
			setData(res.data);
		});
		// getDing().then(res => {
		//     if (res.code) return;
		//     // console.log(res);
		//     dingField.setValues(res.data);
		//     setDingData(res.data);
		// })
	}, []);

	const submit = () => {
		field.validate((error, value) => {
			console.log(error);
			if (error) return;
			setMail(value).then((res) => {
				// console.log(res);
				if (res.data) return;
				Message.show(messageConfig('success', '成功', '邮箱设置成功'));
			});
		});
	};

	const dingSubmit = () => {
		dingField.validate((error, value) => {
			console.log(error);
			if (error) return;
			setDing(value).then((res) => {
				// console.log(res);
				if (res.data) return;
				Message.show(
					messageConfig('success', '成功', '钉钉机器人设置成功')
				);
			});
		});
	};

	const checkBtn = () => {
		let obj = {
			port: null,
			password: null,
			mailPath: null,
			mailServer: null,
			userName: null,
			...field.getValues()
		};
		let arr = [];
		for (let key in obj) {
			key !== 'time' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const checkDingBtn = () => {
		let obj = {
			secretKey: null,
			webhook: null,
			...dingField.getValues()
		};
		let arr = [];
		for (let key in obj) {
			key !== 'time' && arr.push(obj[key]);
		}
		arr.every((item) => item)
			? setDingBtnStatus(false)
			: setDingBtnStatus(true);
	};

	return (
		<div className="alarm-set">
			<div className="box">
				<div className="box-header">
					<div className="header-img">
						<img src={Email} />
					</div>
					<div className="header-info">
						<div>
							<span className="type">邮箱</span>
							<span className={data ? 'status' : 'status none'}>
								{data ? '已设置' : '未设置'}
							</span>
						</div>
						<p>
							设置一个能正常收、发邮件到邮件服务器，告警信息第一时间通过邮件告知，及时、高效、规范。
						</p>
					</div>
				</div>
				<div className="box-content">
					<Row>
						<Col span={13} offset={4}>
							<Form
								field={field}
								{...formItemLayout}
								style={{ padding: '24px' }}
							>
								<Form.Item required label="邮箱服务器">
									<Input
										placeholder="请输入邮箱服务器"
										name="mailServer"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="端口">
									<Input
										placeholder="请输入端口"
										name="port"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="用户">
									<Input
										placeholder="请输入用户"
										name="userName"
										onChange={checkBtn}
										onBlur={(e) =>
											field.setValues({
												mailPath: e.target.value
											})
										}
									/>
								</Form.Item>
								<Form.Item required label="密码">
									<Input
										placeholder="请输入密码"
										name="password"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="告警邮箱地址">
									<Input
										placeholder="所有的告警信息将由该地址发送到您的邮箱"
										name="mailPath"
										onChange={checkBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											field.reset();
											checkBtn();
										}}
									>
										取消
									</Button>
									<Button
										className={
											btnStatus
												? 'test normal'
												: 'test error'
										}
										disabled={btnStatus}
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
									>
										保存
									</Button>
								</div>
							</Form>
						</Col>
					</Row>
				</div>
			</div>
			<div className="box">
				<div className="box-header">
					<div className="header-img">
						<img src={Ding} />
					</div>
					<div className="header-info">
						<div>
							<span className="type">邮箱</span>
							<span
								className={dingData ? 'status' : 'status none'}
							>
								{dingData ? '已设置' : '未设置'}
							</span>
						</div>
						<p>
							设置一个或多个钉钉机器人，告警信息第一时间同步钉钉应用（最多添加10个Webhook）。
						</p>
					</div>
				</div>
				<div className="box-content">
					<Row>
						<Col span={13} offset={4}>
							<Form
								field={dingField}
								{...formItemLayout}
								style={{ padding: '24px' }}
							>
								<Form.Item required label="Webhook地址1">
									<Input
										placeholder="请输入Webhook地址"
										name="webhook"
										onChange={checkDingBtn}
									/>
								</Form.Item>
								<Form.Item
									label="加签密钥"
									labelCol={{ span: 3, offset: 11 }}
									wrapperCol={{ span: 10 }}
								>
									<Input
										placeholder="端口"
										name="secretKey"
										onChange={checkDingBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											dingField.reset();
											setDingBtnStatus(true);
										}}
									>
										取消
									</Button>
									<Button
										className={
											dingBtnStatus
												? 'test normal'
												: 'test error'
										}
										disabled={dingBtnStatus}
									>
										连接测试
									</Button>
									<Button
										className={
											dingBtnStatus
												? 'save normal'
												: 'save error'
										}
										disabled={dingBtnStatus}
										onClick={dingSubmit}
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

export default AlarmSet;
