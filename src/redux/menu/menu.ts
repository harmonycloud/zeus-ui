export const SET_MENU_REFRESH = 'SET_MENU_REFRESH';

export function setMenuRefresh(flag: boolean) {
	return (dispatch: any) => {
		dispatch({
			type: SET_MENU_REFRESH,
			data: flag
		});
	};
}
