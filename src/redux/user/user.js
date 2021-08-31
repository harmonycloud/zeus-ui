import { getUserInfo } from '@/services/user';

export const STORE_USER = 'STORE_USER';

const storeUser = (user) => ({
	user,
	type: STORE_USER
});

export function getUser(isLogin) {
	return async (dispatch) => {
		const result = await getUserInfo(isLogin);
		if (result.success) {
			dispatch(storeUser(result.data));
		}
	};
}
