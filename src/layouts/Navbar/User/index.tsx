import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Icon } from '@alifd/next';
import { Message, Balloon } from '@alicloud/console-components';
import CustomIcon from '@/components/CustomIcon';

import { postLogout } from '@/services/user';
import messageConfig from '@/components/messageConfig';
import EditPasswordForm from './EditPasswordForm';
import { userProps } from './user';
import { getLDAP } from '@/services/user';

import Storage from '@/utils/storage';
import logoutSvg from '@/assets/images/navbar/logout.svg';

import styles from './user.module.scss';

const Tooltip = Balloon.Tooltip;

function User(props: userProps): JSX.Element {
	const { nickName, className, role } = props;
	const [visible, setVisible] = useState(false);
	const [isLDAP, setIsLDAP] = useState<boolean>(false);
	const history = useHistory();

	const logout = () => {
		postLogout().then((res) => {
			if (res.success) {
				Storage.removeLocal('token', true);
				Storage.removeSession('service-list-current', true);
				Storage.removeSession('service-available-current', true);
				Storage.removeLocal('firstAlert', true);
				history.push('/login');
				window.location.reload();
			} else {
				Message.show(messageConfig('error', '错误', res));
			}
		});
	};
	const editPassword = () => {
		setVisible(true);
	};

	useEffect(() => {
		getLDAP().then((res) => {
			res.success && setIsLDAP(res.data.isOn);
		});
	}, []);

	return (
		<div className={`${styles['nav-user-container']} ${className}`}>
			<Icon type="user-circle" />
			<span style={{ marginLeft: '5px' }}>{role.roleName}</span>
			<ul className={styles['nav-user-operator']}>
				<li className={styles['nav-user-container-item']}>
					<p>{nickName}</p>
					<span className={styles['nav-user-role-p']}>
						{role.aliasName}
					</span>
				</li>
				{Storage.getLocal('userName') === 'admin' && (
					<li
						className={styles['nav-user-container-item']}
						onClick={() =>
							history.push('/dataOverview/personlization')
						}
					>
						<CustomIcon type="icon-gexinghua" size={15} />
						<span style={{ marginLeft: '5px' }}>平台管理</span>
					</li>
				)}
				{Storage.getLocal('userName') !== 'admin' && isLDAP ? null : (
					<li
						className={styles['nav-user-container-item']}
						onClick={editPassword}
					>
						<Icon
							type="edit"
							size="small"
							style={{ marginRight: 4, color: '#686A7B' }}
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
