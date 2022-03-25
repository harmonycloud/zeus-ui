import { api } from '@/api.json';

// * 获取项目列表/创建项目
export const getProjects = `${api}/project`;
// * 删除项目
export const deleteProject = `${api}/project/{projectId}`;
// * 获取项目下分区
export const getProjectNamespace = `${api}/project/{projectId}/namespace`;
// * 获取项目下成员
export const getProjectMember = `${api}/project/{projectId}/user`;
