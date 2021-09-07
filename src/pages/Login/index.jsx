import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import JSEncrypt from 'jsencrypt';
import Storage from '@/utils/storage';
import { postLogin, getRsaKey } from '@/services/user';
import styles from './login.module.scss';

export default function Login() {
	const history = useHistory();
	const [account, setAccount] = useState({
		username: '',
		password: ''
	});
	const [message, setMessage] = useState('');
	const [publicKey, setPublicKey] = useState('');

	useEffect(() => {
		getRsaKey().then((res) => {
			console.log(res);
			if (res.success) {
				const pub = `-----BEGIN PUBLIC KEY-----${res.data}-----END PUBLIC KEY-----`;
				Storage.setSession('rsa', pub);
				setPublicKey(pub);
			}
		});
	}, []);

	// * 公钥加密 ---- 修改密码也要加密，目前暂时没有做，可将此方法作为公共方法提取出来
	function encrypt(text) {
		const encrypt = new JSEncrypt();
		encrypt.setPublicKey(publicKey);
		const encrypted = encrypt.encrypt(text);
		return encrypted;
	}

	const submit = (e) => {
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
					Storage.setLocal('token', res.data.token);
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

	return (
		<div className={styles['login']}>
			<form className={styles['login-form']}>
				<header className={styles['login-header']}>
					中间件平台登录
				</header>
				<div className={styles['login-form-box']}>
					<div className={styles['login-input-item']}>
						<input
							type="text"
							className={styles['login-input']}
							value={account.username}
							onChange={(e) =>
								setAccount({
									...account,
									username: e.target.value
								})
							}
							onKeyPress={(event) => {
								if (event.charCode === 13) {
									submit(event);
								}
							}}
							placeholder="请输入登录账户"
						/>
					</div>
					<div className={styles['login-input-item']}>
						<input
							type="password"
							className={styles['login-input']}
							value={account.password}
							onChange={(e) =>
								setAccount({
									...account,
									password: e.target.value
								})
							}
							onKeyPress={(event) => {
								if (event.charCode === 13) {
									submit(event);
								}
							}}
							placeholder="请输入密码"
						/>
					</div>
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
		</div>
	);
}
