import { api } from '@/api.json';

// * 获取项目列表/创建项目
export const getProjects = `${api}/project`;
// * 删除项目
export const deleteProject = `${api}/project/{projectId}`;
// * 获取项目下分区 / 项目绑定分区
export const getProjectNamespace = `${api}/project/{projectId}/namespace`;
// * 获取项目下成员
export const getProjectMember = `${api}/project/{projectId}/user`;
// * 获取项目下的服务相关
export const getProjectMiddleware = `${api}/project/{projectId}/middleware`;
// * 导航栏切换项目时，发送修改token的请求
export const switchProject = `${api}/user/switchProject`;
// * 获取项目下可分配的分区
export const getAllocatableNamespace = `${api}/project/{projectId}/namespace/allocatable`;
