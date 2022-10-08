export const SET_MENU_REFRESH = 'SET_MENU_REFRESH';

export function setMenuRefresh(flag: boolean, clusterId: string) {
	return (dispatch: any) => {
		dispatch({
			type: SET_MENU_REFRESH,
			data: { flag, clusterId }
		});
	};
}
