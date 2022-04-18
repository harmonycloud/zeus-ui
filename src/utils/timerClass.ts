/**
 * 倒计时
 * @param { function } execuFn 执行函数
 * @param { number } leftTime 剩余时间
 */
const countdownTimer = (execuFn: any, leftTime: number) => {
	let timer: any = null;
	timer = setInterval(() => {
		if (leftTime === 0) {
			clearInterval(timer);
			timer = null;
			if (execuFn instanceof Function) execuFn();
		} else leftTime--;
	}, 1000);
	return timer;
};

export default {
	countdownTimer
};
