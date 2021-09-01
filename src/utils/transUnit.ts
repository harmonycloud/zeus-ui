/**
 * 去除Gi单位，也可继续拓展
 */
const removeUnit = (str: string, unit: string) => {
	if (typeof str === 'string') {
		return str.replace(unit, '');
	} else return str;
};

export default {
	removeUnit
};
