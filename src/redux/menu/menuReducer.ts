import { SET_MENU_REFRESH } from './menu';

const defaultState = {
	flag: false
};

export default function menuReducer(state = defaultState, action: any) {
	const { type, data } = action;
	switch (type) {
		case SET_MENU_REFRESH:
			return { ...state, flag: data };
		default:
			return state;
	}
}
