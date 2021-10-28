export const SET_INSTANCE_CURRENT_TAB = 'SET_INSTANCE_CURRENT_TAB';

export function setInstanceCurrentTab(currentTab) {
	console.log(currentTab);
	return (dispatch) => {
		dispatch({
			type: SET_INSTANCE_CURRENT_TAB,
			data: currentTab
		});
	};
}
