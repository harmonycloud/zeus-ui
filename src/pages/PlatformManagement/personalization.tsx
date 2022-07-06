import React, { useEffect, useState } from 'react';
import { Form, Upload, Input, Radio, Button, Modal, notification } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

import { api } from '@/api.json';
import { personalizationProps } from './platformManagement';

import storage from '@/utils/storage';
import { getPersonalConfig, personalized } from '@/services/user';
import { HttpRequestHeader } from 'antd/lib/upload/interface';

const formItemLayout = {
	labelCol: {
		span: 3
	},
	wrapperCol: {
		span: 10
	}
};
const { confirm } = Modal;

function Personlization(props: { activeKey: string | undefined }): JSX.Element {
	const [form] = Form.useForm();

	const headers: HttpRequestHeader = {
		userToken: storage.getLocal('token'),
		authType: storage.getLocal('token') ? '1' : '0'
	};
	const { activeKey } = props;
	const [bgSelect, setBgSelect] = useState<boolean>(false);
	const [loginSelect, setLoginSelect] = useState<boolean>(false);
	const [homeSelect, setHomeSelect] = useState<boolean>(false);
	const [browserSelect, setBrowserSelect] = useState<boolean>(false);
	const [imgRule, setImgRule] = useState<boolean>(false);
	const [backgroundValue, setBackgroundValue] = useState<any>([]);
	const [loginValue, setLoginValue] = useState<any>();
	const [homeValue, setHomeValue] = useState<any>();
	const [browserValue, setBrowserValue] = useState<any>();

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		activeKey === 'personlization' && getData();
	}, [activeKey]);

	const base64ToBlob = (code: string) => {
		const parts = code.split(';base64,');
		const contentType = parts[0].split(':')[1];
		const raw = window.atob(parts[1]);
		const rawLength = raw.length;

		const uInt8Array = new Uint8Array(rawLength);

		for (let i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		return new Blob([uInt8Array], { type: contentType });
	};

	function change_icon(iconUrl: string) {
		const changeFavicon = (link: string) => {
			let $favicon: any = document.querySelector('link[rel="icon"]');
			if ($favicon !== null) {
				$favicon.href = link;
			} else {
				$favicon = document.createElement('link');
				$favicon.rel = 'icon';
				$favicon.href = link;
				document.head.appendChild($favicon);
			}
		};

		// 动态修改网站图标
		changeFavicon(iconUrl);
	}

	const imageData = (name: string, data: string) => {
		return [
			{
				name: name,
				status: 'done',
				size: 1024,
				uid: Math.random(),
				url: data ? URL.createObjectURL(base64ToBlob(data)) : data
			}
		];
	};

	const getData = () => {
		getPersonalConfig().then((res) => {
			if (res.success) {
				storage.setLocal('personalization', res.data);
				form.setFieldsValue({
					...res.data,
					backgroundImage: imageData(
						'background.svg',
						res.data.backgroundImage
					),
					status: '0'
				});
				setBackgroundValue(
					imageData('background.svg', res.data.backgroundImage)
				);
				setLoginValue(imageData('loginlogo.svg', res.data.loginLogo));
				setHomeValue(imageData('home.svg', res.data.homeLogo));
				setBrowserValue(imageData('browser.svg', res.data.tabLogo));
				document.title =
					res.data && res.data.title ? res.data.title : 'Zeus';
				change_icon(res.data.tabLogo);
			}
		});
	};

	const beforeUpload = (info: File) => {
		if (info.size / 1024 / 1024 > 2) {
			notification.warning({
				message: '提示',
				description: '图片过大，请重新上传'
			});
			setImgRule(true);
			return false;
		}
		if (
			info.type !== 'image/svg+xml' &&
			info.type !== 'image/jpeg' &&
			info.type !== 'image/png'
		) {
			notification.warning({
				message: '提示',
				description: '文件格式错误，请重新上传'
			});
			setImgRule(true);
			return false;
		}
	};

	const logoBeforeUpload = (info: File) => {
		if (info.size / 1024 / 1024 > 2) {
			notification.warning({
				message: '提示',
				description: '图片过大，请重新上传'
			});
			setImgRule(true);
			return false;
		}
		if (info.type !== 'image/svg+xml') {
			notification.warning({
				message: '提示',
				description: '文件格式错误，请重新上传'
			});
			setImgRule(true);
			return false;
		}
	};

	const onChange = (type = '', info: any) => {
		if (info.file.status !== 'done') {
			if (type === 'background') {
				setBackgroundValue(info.fileList);
				!info.fileList.length ? setBgSelect(true) : setBgSelect(false);
			} else if (type === 'home') {
				setHomeValue(info.fileList);
				!info.fileList.length
					? setHomeSelect(true)
					: setHomeSelect(false);
			} else if (type === 'login') {
				setLoginValue(info.fileList);
				!info.fileList.length
					? setLoginSelect(true)
					: setLoginSelect(false);
			} else {
				setBrowserValue(info.fileList);
				!info.fileList.length
					? setBrowserSelect(true)
					: setBrowserSelect(false);
			}
		}
		if (info.file.status === 'done') {
			const url =
				`data:image/${
					info.file.response.data.type === 'svg'
						? 'svg+xml'
						: info.file.response.data.type === 'png'
						? 'png'
						: 'jpeg'
				};base64,` + info.file.response.data.bytes;
			notification.success({
				message: '成功',
				description: '图片上传成功'
			});
			if (type === 'background') {
				setBackgroundValue(imageData(info.fileList[0].name, url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					backgroundImage: url
				});
			} else if (type === 'home') {
				setHomeValue(imageData(info.fileList[0].name, url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					homeLogo: url
				});
			} else if (type === 'login') {
				setLoginValue(imageData(info.fileList[0].name, url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					loginLogo: url
				});
			} else {
				setBrowserValue(imageData(info.fileList[0].name, url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					tabLogo: url
				});
			}
			setImgRule(false);
		}
	};

	const onSubmit = () => {
		form.validateFields().then((values: personalizationProps) => {
			if (
				bgSelect ||
				homeSelect ||
				loginSelect ||
				browserSelect ||
				imgRule
			)
				return;

			values.backgroundImage =
				storage.getLocal('personalization').backgroundImage;
			values.loginLogo = storage.getLocal('personalization').loginLogo;
			values.homeLogo = storage.getLocal('personalization').homeLogo;
			values.tabLogo = storage.getLocal('personalization').tabLogo;

			if (values.status === '1') {
				values.status = 'init';
				confirm({
					title: '操作确认',
					content:
						'您之前所有自定义已做修改的地方将恢复至出厂状态，是否继续？',
					onOk() {
						personalized(values).then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '个性化设置成功'
								});
								window.location.reload();
							}
						});
					},
					okText: '确认',
					cancelText: '取消'
				});
			} else {
				values.status = '';
				personalized(values).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '个性化设置成功'
						});
						window.location.reload();
					}
				});
			}
		});
	};

	return (
		<>
			<Form form={form} {...formItemLayout}>
				<h2>登录页配置</h2>
				<Form.Item
					label="背景"
					labelAlign="left"
					rules={[{ required: true, message: '请上传图片' }]}
					// name={'backgroundImage'}
					extra={
						<>
							<p className="upload-info">
								图片支持2M以下的jpg、svg、png格式
							</p>
							{bgSelect && (
								<div style={{ color: '#D93026' }}>
									请上传图片
								</div>
							)}
						</>
					}
				>
					<Upload
						style={{ display: 'inline' }}
						listType="picture-card"
						action={`${api}/user/uploadFile`}
						accept="image/svg,image/jpg,image/png,.svg"
						maxCount={1}
						headers={headers}
						beforeUpload={beforeUpload}
						onChange={(info) => onChange('background', info)}
						fileList={backgroundValue}
					>
						<div className="upload-card">
							<PlusOutlined />
							<div className="next-upload-text">上传</div>
						</div>
					</Upload>
				</Form.Item>
				<Form.Item
					label="登录页logo"
					rules={[{ required: true, message: '请上传图片' }]}
					labelAlign="left"
					// name={'loginLogo'}
					extra={
						<>
							<p className="upload-info">
								图片支持2M以下的svg格式
							</p>
							{loginSelect && (
								<div style={{ color: '#D93026' }}>
									请上传图片
								</div>
							)}
						</>
					}
				>
					<Upload
						style={{ display: 'inline' }}
						listType="picture"
						action={`${api}/user/uploadFile`}
						accept="image/svg,.svg"
						headers={headers}
						maxCount={1}
						beforeUpload={logoBeforeUpload}
						onChange={(info) => onChange('login', info)}
						fileList={loginValue}
					>
						<Button icon={<UploadOutlined />}>上传</Button>
					</Upload>
				</Form.Item>
				<Form.Item
					label="平台名称"
					labelAlign="left"
					name={'platformName'}
					rules={[{ max: 30, message: '长度不能超过30个字符' }]}
				>
					<Input placeholder="我是平台名称，支持空格，限定在30字符内" />
				</Form.Item>
				<Form.Item
					label="Slogan"
					labelAlign="left"
					name={'slogan'}
					rules={[{ max: 50, message: '长度不能超过50个字符' }]}
				>
					<Input.TextArea placeholder="产品说明，字数限定在50字符" />
				</Form.Item>
				<Form.Item
					label="版权声明"
					labelAlign="left"
					name={'copyrightNotice'}
					rules={[{ max: 60, message: '长度不能超过60个字符' }]}
				>
					<Input placeholder="我是版权声明，支持空格，限定在60字符内" />
				</Form.Item>
				<h2>登录后系统页配置</h2>
				<Form.Item
					label="左上角logo"
					labelAlign="left"
					// name={'homeLogo'}
					rules={[{ required: true, message: '请上传图片' }]}
					extra={
						<>
							<p className="upload-info">
								图片支持2M以下的svg格式
							</p>
							{homeSelect && (
								<div style={{ color: '#D93026' }}>
									请上传图片
								</div>
							)}
						</>
					}
				>
					<Upload
						style={{ display: 'inline' }}
						listType="picture-card"
						action={`${api}/user/uploadFile`}
						accept="image/svg,.svg"
						headers={headers}
						maxCount={1}
						beforeUpload={logoBeforeUpload}
						onChange={(info) => onChange('home', info)}
						fileList={homeValue}
					>
						<div className="upload-card">
							<PlusOutlined />
							<div className="next-upload-text">上传</div>
						</div>
					</Upload>
				</Form.Item>
				<Form.Item
					label="浏览器logo"
					labelAlign="left"
					// name={'tabLogo'}
					rules={[{ required: true, message: '请输入上传图片' }]}
					extra={
						<>
							<p className="upload-info">
								图片支持2M以下的svg格式
							</p>
							{browserSelect && (
								<div style={{ color: '#D93026' }}>
									请上传图片
								</div>
							)}
						</>
					}
				>
					<Upload
						style={{ display: 'inline' }}
						listType="picture-card"
						action={`${api}/user/uploadFile`}
						accept="image/svg,.svg"
						headers={headers}
						maxCount={1}
						beforeUpload={logoBeforeUpload}
						onChange={(info) => onChange('browser', info)}
						fileList={browserValue}
					>
						<div className="upload-card">
							<PlusOutlined />
							<div className="next-upload-text">上传</div>
						</div>
					</Upload>
				</Form.Item>
				<Form.Item
					label="浏览器tab标题"
					name={'title'}
					labelAlign="left"
					rules={[
						{ required: true, message: '请输入浏览器标题' },
						{ max: 20, message: '长度不能超过20个字符' }
					]}
				>
					<Input placeholder="我是浏览器标题，字数限制在20字符" />
				</Form.Item>
				<h2>恢复初始化设置</h2>
				<Form.Item
					label="是否恢复初始化"
					labelAlign="left"
					name={'status'}
				>
					<Radio.Group>
						<Radio id="no" value="0">
							否
						</Radio>
						<Radio id="yes" value="1">
							是
						</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>

			<div className="detail-divider" />
			<div>
				<Button type="primary" onClick={onSubmit}>
					提交
				</Button>
				<Button
					style={{ marginLeft: '5px' }}
					onClick={() => form.resetFields()}
				>
					取消
				</Button>
			</div>
		</>
	);
}

export default Personlization;
