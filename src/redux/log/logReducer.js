import { SET_REAL_LOG, CLEAN_REAL_LOG } from './log';

const defaultState = {
	log: ``
};
export default function logReducer(state = defaultState, action) {
	const { type, data } = action;
	switch (type) {
		case SET_REAL_LOG:
			return { ...state, log: data + state.log };
		case CLEAN_REAL_LOG:
			return { ...state, log: `` };
		default:
			return state;
	}
}
