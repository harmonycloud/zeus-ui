import Axios from './request.js';
import * as Role from './role.constants';
import {
	rolesProps,
	deleteProps,
	roleProps,
	updateProps
} from '@/pages/RoleManage/role';

// * 获取用户列表
export const getRoleList: (params: { key: string }) => Promise<rolesProps> =
	(params: { key: string }) => {
		return Axios.get(Role.getRoleList, params);
	};
// * 创建用户
export const createRole: (params: roleProps) => Promise<updateProps> = (
	params: roleProps
) => {
	return Axios.json(Role.createRole, params, {}, 'POST');
};
// * 删除用户
export const deleteRole: (params: { roleId: number }) => Promise<deleteProps> =
	(params: { roleId: number }) => {
		return Axios.delete(Role.updataRole, params);
	};
// * 编辑用户
export const updateRole: (params: roleProps) => Promise<updateProps> = (
	params: roleProps
) => {
	return Axios.json(Role.updataRole, params, {}, 'PUT');
};
