import React, { useEffect, useState, useMemo, useRef, createRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Page, Content, Header } from '@alicloud/console-components-page';
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
import { personalizationProps } from './personalization';
import background from '../../assets/images/login_bg.svg';
import logo from '@/assets/images/logo.svg';
import homeLogo from '@/assets/images/navbar/zeus-logo-small.svg';
import messageConfig from '@/components/messageConfig';
import storage from '@/utils/storage';
import { api } from '@/api.json';
import { getPersonalConfig, personalized } from '@/services/user';
import './index.scss';

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 10
	}
};

function Personlization(): JSX.Element {
	const history = useHistory();
	const field: Field = Field.useField();
	const headers = {
		userToken: storage.getLocal('token'),
		authType: storage.getLocal('token') ? 1 : 0
	};
	const [data, setData] = useState<personalizationProps>();
	const [status, setStatus] = useState<number | string | boolean>('0');
	const [bgSelect, setBgSelect] = useState(false);
	const [loginSelect, setLoginSelect] = useState(false);
	const [homeSelect, setHomeSelect] = useState(false);
	const [imgRule, setImgRule] = useState(false);
	const [backgroundValue, setBackgroundValue] = useState<any>();
	const [loginValue, setLoginValue] = useState<any>();
	const [homeValue, setHomeValue] = useState<any>();

	useEffect(() => {
		getData();
	}, []);

	const getData = () => {
		getPersonalConfig({}).then((res) => {
			if (res.success) {
				if (res.data) {
					setData(res.data);
					setStatus(res.data.status);
					storage.setLocal('personalization', res.data);
					field.setValues(res.data);
					res.data.backgroundPath
						? setBackgroundValue([
								{
									name: 'background.svg',
									state: 'done',
									size: 1024,
									downloadURL:
										api +
										'/images/middleware/' +
										res.data.backgroundPath,
									fileURL:
										api +
										'/images/middleware/' +
										res.data.backgroundPath,
									imgURL:
										api +
										'/images/middleware/' +
										res.data.backgroundPath
								}
						  ])
						: setBackgroundValue([
								{
									name: 'background.svg',
									state: 'done',
									size: 1024,
									downloadURL: background,
									fileURL: background,
									imgURL: background
								}
						  ]);
					res.data.loginLogoPath
						? setLoginValue([
								{
									name: 'login.svg',
									state: 'done',
									size: 1024,
									downloadURL:
										api +
										'/images/middleware/' +
										res.data.loginLogoPath,
									fileURL:
										api +
										'/images/middleware/' +
										res.data.loginLogoPath,
									imgURL:
										api +
										'/images/middleware/' +
										res.data.loginLogoPath
								}
						  ])
						: setLoginValue([
								{
									name: 'login.svg',
									state: 'done',
									size: 1024,
									downloadURL: logo,
									fileURL: logo,
									imgURL: logo
								}
						  ]);
					res.data.homeLogoPath
						? setHomeValue([
								{
									name: 'home.svg',
									state: 'done',
									size: 1024,
									downloadURL:
										api +
										'/images/middleware/' +
										res.data.homeLogoPath,
									fileURL:
										api +
										'/images/middleware/' +
										res.data.homeLogoPath,
									imgURL:
										api +
										'/images/middleware/' +
										res.data.homeLogoPath
								}
						  ])
						: setHomeValue([
								{
									name: 'home.svg',
									state: 'done',
									size: 1024,
									downloadURL: homeLogo,
									fileURL: homeLogo,
									imgURL: homeLogo
								}
						  ]);
					document.title =
						res.data && res.data.title ? res.data.title : 'Zeus';
				} else {
					field.setValues({
						status: '0',
						title: 'Zeus',
						slogan: '我是Slogan，让IT更美好',
						copyrightNotice:
							'Copyeight © 2021 杭州谐云科技有限公司 All rights reserved.Copyeight.',
						platformName: 'Zeus | 中间件管理一体化平台'
					});
					storage.setLocal('personalization', '');
					setBackgroundValue([
						{
							name: 'background.svg',
							state: 'done',
							size: 1024,
							downloadURL: background,
							fileURL: background,
							imgURL: background
						}
					]);
					setLoginValue([
						{
							name: 'login.svg',
							state: 'done',
							size: 1024,
							url: logo
						}
					]);
					setHomeValue([
						{
							name: 'home.svg',
							state: 'done',
							size: 1024,
							downloadURL: homeLogo,
							fileURL: homeLogo,
							imgURL: homeLogo
						}
					]);
				}
			}
		});
	};

	const beforeUpload = (info: any) => {
		// console.log(info);

		if (info.size / 1024 / 1024 > 2) {
			Message.show(messageConfig('warning', '图片过大，请重新上传'));
			setImgRule(true);
			return false;
		}
		if (
			info.type !== 'image/svg+xml' &&
			info.type !== 'image/jpeg' &&
			info.type !== 'image/png'
		) {
			Message.show(messageConfig('warning', '文件格式错误，请重新上传'));
			setImgRule(true);
			return false;
		}
	};

	const onRemove = (info: any) => {
		field.setValues({ background: null });
	};

	const logoBeforeUpload = (info: any) => {
		// console.log(info);

		if (info.size / 1024 / 1024 > 2) {
			Message.show(messageConfig('warning', '图片过大，请重新上传'));
			setImgRule(true);
			return false;
		}
		if (info.type !== 'image/svg+xml') {
			Message.show(messageConfig('warning', '文件格式错误，请重新上传'));
			setImgRule(true);
			return false;
		}
	};

	const onSuccess = (type: string, info: any) => {
		// console.log(info);

		if (info) {
			Message.show(messageConfig('success', '成功', '图片上传成功'));
			if (type === 'background') {
				setBackgroundValue([
					{
						name: info.name,
						state: 'done',
						size: info.size,
						downloadURL: api + '/images/middleware/' + info.name,
						fileURL: api + '/images/middleware/' + info.name,
						imgURL: api + '/images/middleware/' + info.name
					}
				]);
			} else if (type === 'home') {
				setHomeValue([
					{
						name: info.name,
						state: 'done',
						size: info.size,
						downloadURL: api + '/images/middleware/' + info.name,
						fileURL: api + '/images/middleware/' + info.name,
						imgURL: api + '/images/middleware/' + info.name
					}
				]);
			} else {
				setLoginValue([
					{
						name: info.name,
						state: 'done',
						size: info.size,
						url: api + '/images/middleware/' + info.name
					}
				]);
			}
			setImgRule(false);
		}
	};

	const onSubmit = () => {
		field.validate((errors, values: any) => {
			if (errors || bgSelect || homeSelect || loginSelect || imgRule)
				return;
			delete values.backgroundPath;
			delete values.loginLogoPath;
			delete values.homeLogoPath;
			delete values.backgroundImage;
			delete values.loginLogo;
			delete values.homeLogo;

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
								getData();
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
						getData();
					}
				});
			}
		});
	};

	return (
		<Page className="personlization">
			<Header
				hasBackArrow
				renderBackArrow={(elem) => (
					<span
						className="details-go-back"
						onClick={() => window.history.back()}
					>
						{elem}
					</span>
				)}
				title="个性化"
				subTitle="自定义登陆页背景、logo、平台名称等"
			/>
			<Content>
				<Form field={field} {...formItemLayout}>
					<h2>登陆页配置</h2>
					<Form.Item label="背景" required labelTextAlign="left">
						<Upload
							style={{ display: 'inline' }}
							listType="card"
							action={`${api}/user/uploadFile?type=background`}
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
					<Form.Item
						label="登陆页logo"
						required
						labelTextAlign="left"
					>
						<Upload
							style={{ display: 'inline' }}
							listType="image"
							action={`${api}/user/uploadFile?type=login`}
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
					<Form.Item
						label="左上角logo"
						required
						labelTextAlign="left"
					>
						<Upload
							style={{ display: 'inline' }}
							listType="card"
							action={`${api}/user/uploadFile?type=home`}
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
			</Content>
		</Page>
	);
}

export default Personlization;
