import {
	SET_PARAM_TEMPLATE_BASIC,
	SET_PARAM_TEMPLATE_CONFIG,
	SET_PARAM_TEMPLATE_BASIC_CLEAR,
	SET_PARAM_TEMPLATE_CONFIG_CLEAR
} from './param';

const defaultState = {
	name: '',
	description: '',
	customConfigList: []
};

export default function paramReducer(state = defaultState, action: any) {
	const { type, data } = action;
	switch (type) {
		case SET_PARAM_TEMPLATE_BASIC:
			return { ...state, name: data.name, description: data.description };
		case SET_PARAM_TEMPLATE_CONFIG:
			return { ...state, customConfigList: data };
		case SET_PARAM_TEMPLATE_BASIC_CLEAR:
			return { ...state, name: '', description: '' };
		case SET_PARAM_TEMPLATE_CONFIG_CLEAR:
			return { ...state, customConfigList: [] };
		default:
			return state;
	}
}
