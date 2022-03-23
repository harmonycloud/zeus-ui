import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
	Dialog,
	Button,
	Icon,
	Form,
	Input
} from '@alicloud/console-components';

import EditPasswordForm from '@/layouts/Navbar/User/EditPasswordForm';

import JSEncrypt from 'jsencrypt';
import Storage from '@/utils/storage';
import { postLogin, getRsaKey } from '@/services/user';

import { getPersonalConfig } from '@/services/user';
import storage from '@/utils/storage';
import { loginProps } from './login';

import styles from './login.module.scss';

export default function Login() {
	const history = useHistory();
	const [account, setAccount] = useState({
		username: '',
		password: ''
	});
	const [message, setMessage] = useState<string>('');
	const [publicKey, setPublicKey] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [userName, setUserName] = useState<string>('');
	const [rePassword, setRePassword] = useState<number>(0);
	const [data, setData] = useState<loginProps>();

	useEffect(() => {
		getPersonalConfig().then((res) => {
			setData(res.data);
			storage.setLocal('personalization', res.data);
			document.title =
				res.data && res.data.title ? res.data.title : 'Zeus';
			change_icon(res.data.tabLogo);
		});
	}, []);

	useEffect(() => {
		getRsaKey().then((res) => {
			if (res.success) {
				const pub = `-----BEGIN PUBLIC KEY-----${res.data}-----END PUBLIC KEY-----`;
				Storage.setSession('rsa', pub);
				setPublicKey(pub);
			}
		});
	}, []);

	// * 公钥加密 ---- 修改密码也要加密，目前暂时没有做，可将此方法作为公共方法提取出来
	function encrypt(text: string) {
		const encrypt = new JSEncrypt();
		encrypt.setPublicKey(publicKey);
		const encrypted = encrypt.encrypt(text);
		return encrypted;
	}

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

	const submit = (e: any) => {
		e && e.preventDefault();
		setMessage('');
		const { username, password } = account;
		if (!username || !password) {
			setMessage('请输入用户名/密码');
			return;
		}
		// 对输入密码进行rsa加密
		const rsaPass = encrypt(password);

		const data = {
			userName: username,
			password: rsaPass,
			language: Storage.getLocal('language') || 'ch'
		};
		postLogin(data)
			.then((res) => {
				if (res.success) {
					Storage.setLocal('firstAlert', 0);
					Storage.setSession('service-list-current', '全部服务');
					Storage.setSession('service-available-current', '全部服务');
					Storage.setLocal('token', res.data.token);
					Storage.setLocal('userName', res.data.userName);
					Storage.setLocal('roleName', res.data);
					Storage.setLocal(
						'url',
						'https://mpaas.com/assets/images/bg-d2bf59ca.png'
					);
					if (res.data.rePassword) {
						setVisible(true);
						setRePassword(res.data.rePassword);
						setUserName(res.data.userName);
						return;
					}
					history.push('/dataOverview');
					window.location.reload();
				} else {
					setMessage(res.errorMsg || res.errorDetail);
				}
			})
			.catch((err) => {
				setMessage(err.data);
			});
	};
	const onOk = () => {
		setVisible(false);
		setEditVisible(true);
	};

	const onCancel = () => {
		setVisible(false);
		history.push('/dataOverview');
		window.location.reload();
	};

	return (
		<div
			className={styles['login']}
			style={{
				background: `transparent url(${
					data && data.backgroundImage
				}) no-repeat center center /cover`
			}}
		>
			<div className={styles['header']}>
				<img className={styles['logo']} src={data && data.loginLogo} />
				<span className={styles['info']}>
					{(data && data.platformName) ||
						'Zeus | 中间件管理一体化平台'}
				</span>
			</div>
			<div className={styles['slogan']}>
				{(data && data.slogan) || '我是Slogan，让IT更美好'}
			</div>
			<form className={styles['login-form']}>
				<header className={styles['login-header']}>
					中间件平台登录
				</header>
				<div className={styles['login-form-box']}>
					<Form className={styles['form']}>
						<Form.Item label="登录账户">
							<Input
								innerBefore={
									<span className={styles['account']}></span>
								}
								placeholder="请输入登录账户"
								value={account.username}
								onChange={(value) =>
									setAccount({
										...account,
										username: value
									})
								}
								onKeyPress={(event) => {
									if (event.charCode === 13) {
										submit(event);
									}
								}}
							/>
						</Form.Item>
						<Form.Item label="密码" asterisk={false}>
							<Input.Password
								innerBefore={
									<span className={styles['password']}></span>
								}
								placeholder="请输入密码"
								value={account.password}
								onChange={(value) =>
									setAccount({
										...account,
										password: value
									})
								}
								onKeyPress={(event) => {
									if (event.charCode === 13) {
										submit(event);
									}
								}}
							/>
						</Form.Item>
					</Form>
					<div
						className={`${styles['login-submit']} ${styles['centered-item']}`}
					>
						<p className={styles['login-message']}>{message}</p>
					</div>
					<div className={styles['login-submit']}>
						<button
							type="button"
							className={styles['login-button']}
							onClick={(e) => submit(e)}
							style={{ width: '100%' }}
						>
							登 录
						</button>
					</div>
				</div>
			</form>

			<Dialog
				visible={visible}
				onClose={() => setVisible(false)}
				title="改密提示"
				style={{ width: '480px' }}
				footer={
					<div>
						<Button type="primary" onClick={onOk}>
							现在就改
						</Button>
						<Button type="normal" onClick={onCancel}>
							下次再说
						</Button>
					</div>
				}
			>
				<div style={{ display: 'flex' }}>
					<Icon
						type="warning"
						style={{ color: '#faa700', margin: '5px 5px 0 0' }}
					/>
					<div>
						<div style={{ lineHeight: '24px' }}>
							您的密码已使用
							{rePassword}
							天，还有{180 - rePassword}
							天即将过期，到期改密可能无法正常登录，是否现在改密？
						</div>
						<div
							style={{
								fontSize: '12px',
								color: '#666',
								lineHeight: '30px'
							}}
						>
							为保障您的账户资产安全，请定期改密！
						</div>
					</div>
				</div>
			</Dialog>
			{editVisible && (
				<EditPasswordForm
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					userName={userName}
				/>
			)}
			<div className={styles['copy']}>
				{(data && data.copyrightNotice) ||
					'Copyeight © 2021 杭州谐云科技有限公司 All rights reserved.Copyeight.'}
			</div>
		</div>
	);
}
