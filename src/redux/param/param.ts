import { ConfigItem } from '@/pages/ServiceListDetail/detail';

export const SET_PARAM_TEMPLATE_BASIC = 'SET_PARAM_TEMPLATE_BASIC';
export const SET_PARAM_TEMPLATE_CONFIG = 'SET_PARAM_TEMPLATE_CONFIG';
export const SET_PARAM_TEMPLATE_BASIC_CLEAR = 'SET_PARAM_TEMPLATE_BASIC_CLEAR';
export const SET_PARAM_TEMPLATE_CONFIG_CLEAR =
	'SET_PARAM_TEMPLATE_CONFIG_CLEAR';

export interface BasicProps {
	name: string;
	description: string;
}

export function setParamTemplateBasic(
	data: BasicProps
): (dispatch: any) => void {
	return (dispatch: any) => {
		dispatch({
			type: SET_PARAM_TEMPLATE_BASIC,
			data: data
		});
	};
}
export function setParamTemplateConfig(
	data: ConfigItem[]
): (dispatch: any) => void {
	return (dispatch: any) => {
		dispatch({
			type: SET_PARAM_TEMPLATE_CONFIG,
			data: data
		});
	};
}

export function setParamTemplateBasicClear(): (dispatch: any) => void {
	return (dispatch: any) => {
		dispatch({
			type: SET_PARAM_TEMPLATE_BASIC_CLEAR
		});
	};
}

export function setParamTemplateConfigClear(): (dispatch: any) => void {
	return (dispatch: any) => {
		dispatch({
			type: SET_PARAM_TEMPLATE_CONFIG_CLEAR
		});
	};
}
