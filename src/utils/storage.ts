const getLocal = (key: string) => {
	const value = window.localStorage.getItem(key) || '';
	try {
		return JSON.parse(value);
	} catch (error) {
		return value;
	}
};

const setLocal = (key: string, value: any) => {
	window.localStorage.setItem(key, JSON.stringify(value));
};

const removeLocal = (key: string, isClear = false) => {
	if (isClear) {
		window.localStorage.clear();
		return;
	}
	window.localStorage.removeItem(key);
};

const getSession = (key: string) => {
	const value = window.sessionStorage.getItem(key) || '';
	try {
		return JSON.parse(value);
	} catch (error) {
		return value;
	}
};

const setSession = (key: string, value: any) => {
	window.sessionStorage.setItem(key, JSON.stringify(value));
};

const removeSession = (key: string, isClear = false) => {
	if (isClear) {
		window.sessionStorage.clear();
		return;
	}
	window.sessionStorage.removeItem(key);
};

export default {
	getLocal,
	setLocal,
	removeLocal,
	getSession,
	setSession,
	removeSession
};
