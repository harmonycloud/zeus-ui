import { STORE_USER } from './user';

const user = (state = {}, action) => {
	switch (action.type) {
		case STORE_USER:
			return Object.assign({}, state, action.user);
		default:
			return state;
	}
};

export default user;
