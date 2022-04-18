import Axios from './request.js';
import * as TEMPLATE from './template.constants';

interface GetParamsProps {
	templateName?: string;
	type: string;
	uid: string;
	chartVersion: string;
}
// * 获取自定义参数列表
export const getParamsTemps = (params: { type: string }) => {
	return Axios.get(TEMPLATE.getTemplates, params);
};
// * 创建模板
export const createParamsTemp = (params: any) => {
	return Axios.json(TEMPLATE.getTemplates, params, {}, 'POST');
};
// * 获取模板
export const getParamsTemp = (params: GetParamsProps) => {
	return Axios.get(TEMPLATE.updateTemplates, params);
};
// * 编辑模板
export const editParamsTemp = (params: any) => {
	return Axios.json(TEMPLATE.updateTemplates, params, {}, 'PUT');
};
// * 删除模板
export const deleteParamsTemp = (params: { type: string; uids: string }) => {
	return Axios.delete(TEMPLATE.updateTemplates, params);
};
// * 自定义模板
export const initParamsTemp = (params: {
	chartVersion: string;
	type: string;
}) => {
	return Axios.get(TEMPLATE.initTemplate, params);
};
