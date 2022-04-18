export const SET_REAL_LOG = 'SET_REAL_LOG';
export const CLEAN_REAL_LOG = 'CLEAN_REAL_LOG';

export function setRealLog(log) {
	return (dispatch) => {
		dispatch({
			type: SET_REAL_LOG,
			data: log
		});
	};
}
export function cleanRealLog() {
	return (dispatch) => {
		dispatch({
			type: CLEAN_REAL_LOG
		});
	};
}
