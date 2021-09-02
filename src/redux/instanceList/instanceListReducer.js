import { SET_INSTANCE_CURRENT_TAB } from './instanceList.js';

const defaultState = {
	currentTab: ''
};

export default function instanceListReducer(state = defaultState, action) {
	const { type, data } = action;
	switch (type) {
		case SET_INSTANCE_CURRENT_TAB:
			return {
				...state,
				currentTab: data
			};
		default:
			return state;
	}
}
