import { api, user } from '@/api.json';

export const loginApi = `${user}/auth/login`;
export const logoutApi = `${user}/auth/logout`;
export const userInfoApi = `${api}/users/current`;
export const menuApi = `${api}/roles/{roleId}/menu`;
// * lisence
export const license = `${api}/system/configs/license`;
// * 获取rsa 公钥
export const getRsaKey = `${api}/auth/rsa/public`;
// * 用户管理相关接口
export const getUserList = `${api}/user/list`;
// * 创建用户
export const createUser = `${api}/user`;
// * 修改用户信息 / 删除用户信息 / 获取用户信息
export const updateUser = `${api}/user/{userName}`;
// * 修改用户密码
export const updatePassword = `${api}/user/{userName}/password`;
// * 重置密码
export const resetPassword = `${api}/user/{userName}/password/reset`;
// * 获取菜单列表
export const getMenus = `${api}/user/menu`;
// * 获取角色列表
export const getRoles = `${api}/role/list`;
// * 获取角色列表
export const getPersonalConfig = `${api}/user/getPersonalConfig`;
// * 添加个性化配置
export const personalized = `${api}/user/personalized`;
// * 获取登录用户列表及通知人列表
export const users = `${api}/user/users`;
// * 选择被通知人
export const insertUser = `${api}/mail/insertUser`;