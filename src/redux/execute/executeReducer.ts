import { REFRESH_EXECUTION_TABLE } from './execute';
const defaultState = {
	refreshFlag: false
};

export default function executeReducer(state = defaultState, action: any) {
	const { type, data } = action;
	switch (type) {
		case REFRESH_EXECUTION_TABLE:
			return { ...state, refreshFlag: data };
		default:
			return state;
	}
}
