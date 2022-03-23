import React, { useEffect, useState } from 'react';
import {
	Button,
	Form,
	Upload,
	Icon,
	Input,
	Radio,
	Field,
	Message,
	Dialog
} from '@alicloud/console-components';

import { personalizationProps } from './platformManagement';
import messageConfig from '@/components/messageConfig';
import { api } from '@/api.json';

import storage from '@/utils/storage';
import { getPersonalConfig, personalized } from '@/services/user';

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 10
	}
};

function Personlization(props: { activeKey: string | number }): JSX.Element {
	const field: Field = Field.useField();
	const headers = {
		userToken: storage.getLocal('token'),
		authType: storage.getLocal('token') ? 1 : 0
	};
	const { activeKey } = props;
	const [data, setData] = useState<personalizationProps>();
	const [status, setStatus] = useState<number | string | boolean>('0');
	const [bgSelect, setBgSelect] = useState<boolean>(false);
	const [loginSelect, setLoginSelect] = useState<boolean>(false);
	const [homeSelect, setHomeSelect] = useState<boolean>(false);
	const [browserSelect,setBrowserSelect] = useState<boolean>(false);
	const [imgRule, setImgRule] = useState<boolean>(false);
	const [backgroundValue, setBackgroundValue] = useState<any>();
	const [loginValue, setLoginValue] = useState<any>();
	const [homeValue, setHomeValue] = useState<any>();
	const [browserValue,setBrowserValue] = useState<any>();

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		activeKey === 'personlization' && getData();
	}, [activeKey]);

	const base64ToBlob = (code: any) => {
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
		const changeFavicon = (link: any) => {
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
				state: 'done',
				size: 1024,
				downloadURL: data ? URL.createObjectURL(base64ToBlob(data)) : data,
				fileURL: data,
				imgURL: data
			}
		];
	};

	const getData = () => {
		getPersonalConfig().then((res) => {
			if (res.success) {
				setData(res.data);
				setStatus(res.data.status);
				storage.setLocal('personalization', res.data);
				field.setValues({ ...res.data, status: '0' });
				setStatus('0');
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

	const beforeUpload = (info: any) => {
		if (info.size / 1024 / 1024 > 2) {
			Message.show(
				messageConfig('warning', '提示', '图片过大，请重新上传')
			);
			setImgRule(true);
			return false;
		}
		if (
			info.type !== 'image/svg+xml' &&
			info.type !== 'image/jpeg' &&
			info.type !== 'image/png'
		) {
			Message.show(
				messageConfig('warning', '提示', '文件格式错误，请重新上传')
			);
			setImgRule(true);
			return false;
		}
	};

	const onRemove = (info: any) => {
		field.setValues({ background: null });
	};

	const logoBeforeUpload = (info: any) => {
		if (info.size / 1024 / 1024 > 2) {
			Message.show(
				messageConfig('warning', '提示', '图片过大，请重新上传')
			);
			setImgRule(true);
			return false;
		}
		if (info.type !== 'image/svg+xml') {
			Message.show(
				messageConfig('warning', '提示', '文件格式错误，请重新上传')
			);
			setImgRule(true);
			return false;
		}
	};

	const onSuccess = (type = '', info: any) => {
		if (!info.response.code)
			Message.show(messageConfig('success', '成功', '图片上传成功'));
		if (info) {
			const url =
				`data:image/${
					info.response.data.type === 'svg'
						? 'svg+xml'
						: info.response.data.type === 'png'
						? 'png'
						: 'jpeg'
				};base64,` + info.response.data.bytes;
			if (type === 'background') {
				setBackgroundValue(imageData('background.svg', url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					backgroundImage: url
				});
			} else if (type === 'home') {
				setHomeValue(imageData('home.svg', url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					homeLogo: url
				});
			} else if(type === 'login') {
				setLoginValue(imageData('loginlogo.svg', url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					loginLogo: url
				});
			}else{
				setBrowserValue(imageData('browser.svg', url));
				storage.setLocal('personalization', {
					...storage.getLocal('personalization'),
					browserLogo: url
				});
			}
			setImgRule(false);
		}
	};

	const onSubmit = () => {
		field.validate((errors, values: any) => {
			if (errors || bgSelect || homeSelect || loginSelect || browserSelect || imgRule)
				return;
				
			values.backgroundImage =
				storage.getLocal('personalization').backgroundImage;
			values.loginLogo = storage.getLocal('personalization').loginLogo;
			values.homeLogo = storage.getLocal('personalization').homeLogo;
			values.tabLogo = storage.getLocal('personalization').tabLogo;

			if (values.status === '1') {
				values.status = 'init';
				Dialog.show({
					title: '操作确认',
					content:
						'您之前所有自定义已做修改的地方将恢复至出厂状态，是否继续？',
					onOk: () => {
						personalized(values).then((res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'个性化设置成功'
									)
								);
								window.location.reload();
							}
						});
					}
				});
			} else {
				values.status = '';
				personalized(values).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '个性化设置成功')
						);
						window.location.reload();
					}
				});
			}
		});
	};

	return (
		<>
			<Form field={field} {...formItemLayout}>
				<h2>登陆页配置</h2>
				<Form.Item label="背景" required labelTextAlign="left">
					<Upload
						style={{ display: 'inline' }}
						listType="card"
						action={`${api}/user/uploadFile`}
						accept="image/svg,image/jpg,image/png,.svg"
						limit={1}
						useDataURL={true}
						headers={headers}
						beforeUpload={beforeUpload}
						onRemove={onRemove}
						onChange={(value) => {
							!value.length
								? setBgSelect(true)
								: setBgSelect(false);
						}}
						onSuccess={(info) => onSuccess('background', info)}
						value={backgroundValue}
					>
						<div className="next-upload-card">
							<Icon type="upload" size="large" />
							<div className="next-upload-text">上传</div>
						</div>
					</Upload>
					<p className="upload-info">
						图片支持2M以下的jpg、svg、png格式
					</p>
					{bgSelect && (
						<div style={{ color: '#D93026' }}>请上传图片</div>
					)}
				</Form.Item>
				<Form.Item label="登陆页logo" required labelTextAlign="left">
					<Upload
						style={{ display: 'inline' }}
						listType="image"
						action={`${api}/user/uploadFile`}
						accept="image/svg,.svg"
						limit={1}
						useDataURL={true}
						headers={headers}
						beforeUpload={logoBeforeUpload}
						onSuccess={(info) => onSuccess('login', info)}
						onChange={(value) => {
							!value.length
								? setLoginSelect(true)
								: setLoginSelect(false);
						}}
						value={loginValue}
					>
						<Button>
							<Icon type="upload" />
							上传
						</Button>
					</Upload>
					<p className="upload-info">图片支持2M以下的svg格式</p>
					{loginSelect && (
						<div style={{ color: '#D93026' }}>请上传图片</div>
					)}
				</Form.Item>
				<Form.Item
					label="平台名称"
					labelTextAlign="left"
					maxLength={30}
					minmaxLengthMessage="长度不能超过30个字符"
				>
					<Input
						name="platformName"
						placeholder="我是平台名称，支持空格，限定在30字符内"
					/>
				</Form.Item>
				<Form.Item
					label="Slogan"
					labelTextAlign="left"
					maxLength={50}
					minmaxLengthMessage="长度不能超过50个字符"
				>
					<Input.TextArea
						name="slogan"
						placeholder="产品说明，字数限定在50字符"
					/>
				</Form.Item>
				<Form.Item
					label="版本声明"
					labelTextAlign="left"
					maxLength={60}
					minmaxLengthMessage="长度不能超过60个字符"
				>
					<Input
						name="copyrightNotice"
						placeholder="我是版权声明，支持空格，限定在60字符内"
					/>
				</Form.Item>
				<h2>登陆后系统页配置</h2>
				<Form.Item label="左上角logo" required labelTextAlign="left">
					<Upload
						style={{ display: 'inline' }}
						listType="card"
						action={`${api}/user/uploadFile`}
						accept="image/svg,.svg"
						headers={headers}
						useDataURL={true}
						limit={1}
						beforeUpload={logoBeforeUpload}
						onSuccess={(info) => onSuccess('home', info)}
						onChange={(value) => {
							!value.length
								? setHomeSelect(true)
								: setHomeSelect(false);
						}}
						value={homeValue}
					>
						<div className="next-upload-card">
							<Icon type="upload" size="large" />
							<div className="next-upload-text">上传</div>
						</div>
					</Upload>
					<p className="upload-info">图片支持2M以下的svg格式</p>
					{homeSelect && (
						<div style={{ color: '#D93026' }}>请上传图片</div>
					)}
				</Form.Item>
				<Form.Item label="浏览器logo" required labelTextAlign="left">
					<Upload
						style={{ display: 'inline' }}
						listType="card"
						action={`${api}/user/uploadFile`}
						accept="image/svg,.svg"
						headers={headers}
						useDataURL={true}
						limit={1}
						beforeUpload={logoBeforeUpload}
						onSuccess={(info) => onSuccess('browser', info)}
						onChange={(value) => {
							!value.length
								? setBrowserSelect(true)
								: setBrowserSelect(false);
						}}
						value={browserValue}
					>
						<div className="next-upload-card">
							<Icon type="upload" size="large" />
							<div className="next-upload-text">上传</div>
						</div>
					</Upload>
					<p className="upload-info">图片支持2M以下的svg格式</p>
					{browserSelect && (
						<div style={{ color: '#D93026' }}>请上传图片</div>
					)}
				</Form.Item>
				<Form.Item
					label="浏览器tab标题"
					required
					requiredMessage="请输入浏览器标题"
					labelTextAlign="left"
					maxLength={20}
					minmaxLengthMessage="长度不能超过20个字符"
				>
					<Input
						name="title"
						placeholder="我是浏览器标题，字数限制在20字符"
					/>
				</Form.Item>
				<h2>恢复初始化设置</h2>
				<Form.Item label="是否恢复初始化" labelTextAlign="left">
					<Radio.Group
						name="status"
						onChange={(value) => setStatus(value)}
						defaultValue={'0'}
					>
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
					onClick={() => field.reset()}
				>
					取消
				</Button>
			</div>
		</>
	);
}

export default Personlization;
