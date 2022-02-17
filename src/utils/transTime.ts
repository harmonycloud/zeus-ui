import { Moment } from 'moment';

/**
 * js日期转化
 * @param {Date} date js日期对象
 * @param {String} format 期望日期字符串
 */
interface timeProps {
	'M+': number;
	'd+': number;
	'h+': number;
	'm+': number;
	's+': number;
	'q+': number;
	'S+': number;
	[propsName: string]: any;
}
const formatDate: (date: Date, format: string) => string = (
	date: Date,
	format: string
) => {
	const time: timeProps = {
		'M+': date.getMonth() + 1, //月份
		'd+': date.getDate(), //日
		'h+': date.getHours(), //小时
		'm+': date.getMinutes(), //分
		's+': date.getSeconds(), //秒
		'q+': Math.floor((date.getMonth() + 3) / 3), //季度
		'S+': date.getMilliseconds() //毫秒
	};
	if (/(y+)/i.test(format)) {
		format = format.replace(
			RegExp.$1,
			(date.getFullYear() + '').substr(4 - RegExp.$1.length)
		);
	}
	for (const k in time) {
		if (new RegExp('(' + k + ')').test(format)) {
			format = format.replace(
				RegExp.$1,
				RegExp.$1.length === 1
					? time[k]
					: ('00' + time[k]).substr(('' + time[k]).length)
			);
		}
	}
	return format;
};

/**
 * 格林威治时间转本地时间
 * @param {String} input java格式的日期
 */
const gmt2local = (input: string) => {
	//input是传入的字符串
	if (input) {
		const date = new Date(input); // 带TZ的时间字符串，可以自动转化为本地时间
		// let time = date.getTime();
		// time -= date.getTimezoneOffset() * 60000; // getTimezoneOffset: 返回格林威治时间和本地时间之间的时差
		return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
	} else return input;
};

/**
 * 本地时间转格林威治时间
 * @param {String} input java格式的日期
 */
const local2gmt = (input: string) => {
	//input是传入的字符串
	if (input) {
		const date = new Date(input);
		let time = date.getTime();
		time += date.getTimezoneOffset() * 60000;
		return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss');
	} else return input;
};
/**
 * 本地时间转格林威治时间
 * @param {String} input YYYY-MM-DDTHH:mm:ss[Z]格式的日期
 */
const local2gmt2 = (input: string | Moment) => {
	//input是传入的字符串
	if (input) {
		const date = new Date(input as string);
		let time = date.getTime();
		time += date.getTimezoneOffset() * 60000;
		return formatDate(new Date(time), 'YYYY-MM-ddThh:mm:ssZ');
	} else return input;
};
export default {
	formatDate,
	gmt2local,
	local2gmt,
	local2gmt2
};
