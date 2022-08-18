import { SET_MENU_REFRESH } from './menu';

const defaultState = {
	flag: false,
	clusterId: ''
};

export default function menuReducer(state = defaultState, action: any) {
	const { type, data } = action;
	switch (type) {
		case SET_MENU_REFRESH:
			return { ...state, flag: data.flag, clusterId: data.clusterId };
		default:
			return state;
	}
}
