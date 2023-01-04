import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Popover } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';
import { notification } from 'antd';
import { connect } from 'react-redux';

import { postLogout } from '@/services/user';
import EditPasswordForm from './EditPasswordForm';
import { userProps } from './user';
import { getLDAP } from '@/services/user';
import { getIsAccessGYT } from '@/services/common';
import Storage from '@/utils/storage';
import { StoreState } from '@/types';
import logoutSvg from '@/assets/images/navbar/logout.svg';

import styles from './user.module.scss';

function User(props: userProps): JSX.Element {
	const { nickName, className, role } = props;
	const [visible, setVisible] = useState<boolean>(false);
	const [isLDAP, setIsLDAP] = useState<boolean>(false);
	const [isAccess, setIsAccess] = useState<boolean>(false);
	// const [checked, setChecked] = useState<boolean>(false);
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
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	const title = (
		<div className={styles['nav-user-icon-box']}>
			<div>{nickName}</div>
			<span className={styles['nav-user-role-p']}>{role?.userName}</span>
		</div>
	);
	const content = () => {
		return (
			<ul>
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
				{Storage.getLocal('userName') !== 'admin' &&
				(isLDAP || isAccess) ? null : (
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
		);
	};
	return (
		<>
			<Popover
				overlayClassName="zeus-nav"
				placement="bottomRight"
				title={title}
				content={content}
			>
				<div className={styles['nav-icon-font']}>
					<IconFont
						type="icon-user-circle"
						style={{
							fontSize: '20px'
						}}
					/>
				</div>
			</Popover>
			{visible && (
				<EditPasswordForm
					visible={visible}
					onCancel={() => setVisible(false)}
					userName={role.userName}
				/>
			)}
		</>
		// <div className={`${styles['nav-user-container']} ${className}`}>
		// 	<IconFont
		// 		type="icon-user-circle"
		// 		style={{
		// 			fontSize: '20px',
		// 			verticalAlign: 'middle'
		// 		}}
		// 	/>
		// 	<ul className={styles['nav-user-operator']}>
		// 	</ul>
		// </div>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(User);
