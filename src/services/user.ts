import Axios from './request.js';
import * as USER from './user.constants';
import {
	usersProps,
	deleteProps,
	userProps,
	rolesProps,
	updateProps,
	sendDataParams
} from '@/pages/UserManage/user';

export const postLogin = (params: any) => {
	return Axios.post(USER.loginApi, params);
};

export const postLogout = (params?: any) => {
	return Axios.post(USER.logoutApi, params);
};

export const getUserInfo = (params: any) => {
	return Axios.get(USER.userInfoApi, params);
};
// * 根据用户权限获取菜单
export const getMenu = (params?: any) => {
	return Axios.get(USER.getMenus, params);
};
// * 根据项目和集群获取服务列表子菜单
export const getServiceListChildMenu = (params: {
	projectId: string;
	clusterId: string;
}) => {
	return Axios.get(USER.getChildMenu, params);
};

export const getLicense = () => {
	return Axios.get(USER.license);
};

export const putLicense = (params: any) => {
	return Axios.put(USER.license, params);
};
// * 获取rsa公钥
export const getRsaKey = () => {
	return Axios.get(USER.getRsaKey);
};
// * 获取用户列表
export const getUserList: (params: {
	keyword: string;
}) => Promise<usersProps> = (params: { keyword: string }) => {
	return Axios.get(USER.getUserList, params);
};
// * 删除用户
export const deleteUser: (params: {
	userName: string;
}) => Promise<deleteProps> = (params: { userName: string }) => {
	return Axios.delete(USER.updateUser, params);
};
// * 编辑用户
export const updateUser: (params: sendDataParams) => Promise<updateProps> = (
	params: sendDataParams
) => {
	return Axios.json(USER.updateUser, params, {}, 'PUT');
};
// * 重置密码
export const resetPassword: (params: {
	userName: string;
}) => Promise<deleteProps> = (params: { userName: string }) => {
	return Axios.post(USER.resetPassword, params);
};
// * 获取角色列表
export const getRoles: () => Promise<rolesProps> = () => {
	return Axios.get(USER.getRoles);
};
// * 创建用户
export const createUser: (params: sendDataParams) => Promise<updateProps> = (
	params: sendDataParams
) => {
	return Axios.json(USER.createUser, params, {}, 'POST');
};
// * 获取用户信息
export const getUserInformation: () => Promise<usersProps> = () => {
	return Axios.get(USER.createUser);
};
// * 修改用户密码
export const updatePassword = (params: any) => {
	return Axios.put(USER.updatePassword, params);
};
// * 获取个性化配置
export const getPersonalConfig = () => {
	return Axios.get(USER.getPersonalConfig);
};
// * 添加个性化配置
export const personalized = (params: any) => {
	return Axios.json(
		USER.personalized + '?status=' + params.status,
		params,
		{},
		'POST'
	);
};
// * 获取登录用户列表及通知人列表
export const getUsers = (params: any) => {
	return Axios.get(USER.users, params);
};
// * 选择被通知人
export const sendInsertUser = (params: any) => {
	return Axios.json(USER.insertUser, params, {}, 'POST');
};
// * 选择钉钉、或者钉钉邮箱告警告警
export const insertDing = (params: any) => {
	return Axios.json(USER.insertDing, params, {}, 'POST');
};
// * LDAP 连接测试
export const checkLDAP = (params: any) => {
	return Axios.json(USER.connectionCheck, params, {}, 'POST');
};
// * 开启LDAP
export const enableLDAP = (params: any) => {
	return Axios.json(USER.enable, params, {}, 'POST');
};
// * 查询LDAP信息
export const getLDAP = () => {
	return Axios.get(USER.detail);
};
// * 关闭LDAP
export const disableLDAP = () => {
	return Axios.put(USER.disable);
};
