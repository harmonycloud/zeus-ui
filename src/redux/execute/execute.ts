export const REFRESH_EXECUTION_TABLE = 'REFRESH_EXECUTION_TABLE';

export function setRefreshFlag(data: boolean) {
	return (dispatch: any) => {
		dispatch({
			type: REFRESH_EXECUTION_TABLE,
			data: data
		});
	};
}
