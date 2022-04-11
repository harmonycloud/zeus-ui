import Axios from './request.js';
import * as PROJECT from './project.constants';

interface paramProps {
	projectId: string;
	[propName: string]: any;
}

export const getProjects = (params: { key: string }) => {
	return Axios.get(PROJECT.getProjects, params);
};
export const createProject = (params: any) => {
	return Axios.json(PROJECT.getProjects, params, {}, 'POST');
};
export const deleteProject = (param: paramProps) => {
	return Axios.delete(PROJECT.deleteProject, param);
};
export const updateProject = (param: paramProps) => {
	return Axios.json(PROJECT.deleteProject, param, {}, 'PUT');
};
export const getProjectNamespace = (param: paramProps) => {
	return Axios.get(PROJECT.getProjectNamespace, param);
};
export const bingNamespace = (params: paramProps) => {
	return Axios.json(PROJECT.getProjectNamespace, params, {}, 'POST');
};
export const unBindNamespace = (params: paramProps) => {
	return Axios.delete(PROJECT.getProjectNamespace, params);
};
export const getProjectMember = (param: paramProps) => {
	return Axios.get(PROJECT.getProjectMember, param);
};
export const bindProjectMember = (param: paramProps) => {
	return Axios.json(PROJECT.getProjectMember, param, {}, 'POST');
};
export const updateProjectMember = (param: paramProps) => {
	return Axios.json(PROJECT.getProjectMember, param, {}, 'PUT');
};
export const deleteProjectMember = (param: paramProps) => {
	return Axios.delete(PROJECT.getProjectMember, param);
};
export const getProjectMiddleware = (param: paramProps) => {
	return Axios.get(PROJECT.getProjectMiddleware, param);
};
export const switchProjectGetToken = (param: paramProps) => {
	return Axios.get(PROJECT.switchProject, param);
};
export const getAllocatableNamespace = () => {
	return Axios.get(PROJECT.getAllocatableNamespace);
};
export const getProjectMiddlewareCount = () => {
	return Axios.get(PROJECT.getProjectMiddlewareCount);
};
