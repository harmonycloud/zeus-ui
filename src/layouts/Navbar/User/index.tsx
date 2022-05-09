import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';
import { notification } from 'antd';

import { postLogout } from '@/services/user';
import EditPasswordForm from './EditPasswordForm';
import { userProps } from './user';
import { getLDAP } from '@/services/user';

import Storage from '@/utils/storage';
import logoutSvg from '@/assets/images/navbar/logout.svg';

import styles from './user.module.scss';

function User(props: userProps): JSX.Element {
	const { nickName, className, role } = props;
	const [visible, setVisible] = useState<boolean>(false);
	const [isLDAP, setIsLDAP] = useState<boolean>(false);
	const history = useHistory();

	const logout = () => {
		postLogout().then((res) => {
			if (res.success) {
				Storage.removeLocal('token', true);
				Storage.removeSession('service-available-current', true);
				Storage.removeLocal('firstAlert', true);
				history.push('/login');
				window.location.reload();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const editPassword = () => {
		setVisible(true);
	};

	useEffect(() => {
		getLDAP().then((res: any) => {
			res.success && setIsLDAP(res.data.isOn);
		});
	}, []);

	return (
		<div className={`${styles['nav-user-container']} ${className}`}>
			<IconFont
				type="icon-user-circle"
				style={{
					fontSize: '20px',
					verticalAlign: 'middle'
				}}
			/>
			<ul className={styles['nav-user-operator']}>
				<li className={styles['nav-user-container-item']}>
					<p>{nickName}</p>
					<span className={styles['nav-user-role-p']}>
						{role.userName}
					</span>
				</li>
				{Storage.getLocal('userName') === 'admin' && (
					<li
						className={styles['nav-user-container-item']}
						onClick={() =>
							history.push('/dataOverview/personlization')
						}
					>
						<IconFont
							type="icon-gexinghua"
							style={{
								fontSize: '14px',
								marginRight: '4px'
							}}
						/>
						<span>平台管理</span>
					</li>
				)}
				{Storage.getLocal('userName') !== 'admin' && isLDAP ? null : (
					<li
						className={styles['nav-user-container-item']}
						onClick={editPassword}
					>
						<EditOutlined
							style={{ fontSize: '14px', marginRight: '4px' }}
						/>
						修改密码
					</li>
				)}
				<li
					className={styles['nav-user-container-item']}
					onClick={logout}
				>
					<img src={logoutSvg} alt="退出" />
					退出登录
				</li>
			</ul>
			{visible && (
				<EditPasswordForm
					visible={visible}
					onCancel={() => setVisible(false)}
					userName={role.userName}
				/>
			)}
		</div>
	);
}

export default User;
