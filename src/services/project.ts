import Axios from './request.js';
import * as PROJECT from './project.constants';

interface paramProps {
	projectId: string;
	[propName: string]: any;
}
export const getProjects = () => {
	return Axios.get(PROJECT.getProjects);
};
export const createProject = (params: any) => {
	return Axios.json(PROJECT.getProjects, params, {}, 'POST');
};
export const deleteProject = (param: paramProps) => {
	return Axios.delete(PROJECT.deleteProject, param);
};
export const getProjectNamespace = (param: paramProps) => {
	return Axios.get(PROJECT.getProjectNamespace, param);
};
export const getProjectMember = (param: paramProps) => {
	return Axios.get(PROJECT.getProjectMember, param);
};
export const bingNamespace = (params: paramProps) => {
	return Axios.json(PROJECT.getProjectNamespace, params, {}, 'POST');
};
