import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import JSEncrypt from 'jsencrypt';
import Storage from '@/utils/storage';
import { postLogin, getRsaKey } from '@/services/user';
import EditPasswordForm from '@/layouts/Navbar/User/EditPasswordForm';
import { Dialog, Button } from '@alicloud/console-components';
import styles from './login.module.scss';

export default function Login() {
	const history = useHistory();
	const [account, setAccount] = useState({
		username: '',
		password: ''
	});
	const [message, setMessage] = useState('');
	const [publicKey, setPublicKey] = useState('');
	const [visible, setVisible] = useState(false);
	const [editVisible, setEditVisible] = useState(false);
	const [userName, setUserName] = useState(false);
	const [rePassword, setRePassword] = useState();

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
					Storage.setSession('service-list-current', '全部服务');
					Storage.setSession('service-available-current', '全部服务');
					Storage.setLocal('token', res.data.token);
					setUserName(res.data.userName);
					history.push('/dataOverview');
					if (res.data.rePassword) {
						alert(res.data.rePassword);
					}
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

			<Dialog
				// visible={visible}
				// onOk={onOk}
				// onCancel={onCancel}
				// onClose={onCancel}
				title="改密提示"
				style={{ width: '480px' }}
				footer={
					<div>
						<Button warning type="primary" onClick={onOk}>
							现在就改
						</Button>
						<Button
							warning
							type="primary"
							onClick={() => setVisible(false)}
						>
							下次再说
						</Button>
					</div>
				}
			>
				<div>
					您的密码已使用xxx天，还有xxx天即将过期，到期改密可能无法正常登录，是否现在改密？
				</div>
				<div>为保障您的账户资产安全，请定期改密！</div>
			</Dialog>
			{editVisible && (
				<EditPasswordForm
					visible={visible}
					onCancel={() => setEditVisible(false)}
					userName={userName}
				/>
			)}
		</div>
	);
}
