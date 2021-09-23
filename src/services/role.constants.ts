import { api } from '../api.json';

// * 创建角色
export const createRole = `${api}/role`;
// * 修改角色信息 / 删除角色信息
export const updataRole = `${api}/role/{roleId}`;
// * 获取角色列表
export const getRoleList = `${api}/role/list`;
// * 获取菜单列表
export const getMenus = `${api}/user/menu`;
