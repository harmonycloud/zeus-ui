const getPieOption = (data: { [propName: string]: any } | null | undefined) => {
	const option = {
		tooltip: {
			trigger: 'item'
		},
		legend: {
			bottom: 0,
			left: 'center',
			icon: 'circle',
			itemWidth: 8,
			itemHeight: 8,
			itemStyle: {
				fontSize: 12
			},
			formatter: (name: unknown) => {
				const total = data?.total || 0;
				let target = 0;
				if (data)
					name === '运行正常'
						? (target = data.running)
						: (target = data.error);
				const arr = [
					'{a|' + name + '}',
					'{b|' + '|' + '}',
					'{c|' + ((target / total) * 100).toFixed(2) + '%}',
					'{d|' + target + '个}'
				];
				return arr.join(' ');
			},
			textStyle: {
				lineHeight: 22,
				fontSize: 10,
				rich: {
					b: {
						fontSize: 9,
						color: 'rgba(0, 0, 0, 0.45)'
					},
					c: {
						fontSize: 9,
						color: 'rgba(0, 0, 0, 0.45)'
					}
				}
			}
		},
		title: {
			text: data ? data.total + '个' : '',
			left: 'center',
			top: '30%',
			textStyle: {
				color: 'rgba(0, 0, 0, 0.85)',
				fontSize: 24,
				align: 'center',
				fontWeight: 0
			}
		},
		graphic: {
			type: 'text',
			left: 'center',
			top: '50%',
			style: {
				text: data ? '总数' : '',
				textAlign: 'center',
				fill: 'rgba(0, 0, 0, 0.45)',
				fontSize: 14
			}
		},
		series: [
			{
				name: '控制器状态',
				type: 'pie',
				center: ['50%', '40%'],
				radius: ['65%', '80%'],
				avoidLabelOverlap: false,
				color: ['#00a700', '#d92026'],
				label: {
					show: false,
					position: 'center'
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '14',
						fontWeight: 'bold'
					}
				},
				labelLine: {
					show: false
				},
				data: [
					{ value: data?.running || 0, name: '运行正常' },
					{ value: data?.error || 0, name: '运行异常' }
				]
			}
		]
	};

	return option;
};
const getLineOption = (
	data: { [propName: string]: any } | null | undefined
) => {
	const option = {
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			left: 0,
			icon: 'none',
			itemStyle: {
				fontSize: 12
			},
			formatter: (name: unknown) => {
				let target = 0;
				if (data)
					name === '提示'
						? (target = data.infoSum)
						: name === '告警'
						? (target = data.warningSum)
						: (target = data.criticalSum);
				const arr = [
					'{a|' + target + '}',
					'{b|' + '个\n' + '}',
					'{c|' + name + '}'
				];
				return arr.join('');
			},
			textStyle: {
				lineHeight: 22,
				fontSize: 10,
				rich: {
					a: {
						fontSize: 18,
						fontFamily: 'PingFangHK-Semibold, PingFangHK',
						lineHeight: 24,
						color: ['#00A7FA', '#FAA700', '#FF4D4F']
					},
					b: {
						fontSize: 10,
						lineHeight: 18,
						color: '#666666',
						fontFamily: 'PingFangSC-Regular, PingFang SC'
					},
					c: {
						fontSize: 10,
						lineHeight: 18,
						color: '#666666',
						fontFamily: 'PingFangHK-Regular, PingFangHK'
					}
				}
			}
		},
		grid: {
			left: '1%',
			bottom: '5%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: data?.infoList.map((item: any) =>
				item.alerttime.substring(11, 16)
			)
		},
		yAxis: {
			type: 'value',
			axisLine: {
				show: false
			},
			splitNumber: 3,
			splitLine: {
				lineStyle: {
					type: 'dashed' // y轴分割线类型
				}
			}
		},
		series: [
			{
				name: '提示',
				type: 'line',
				symbol: 'none',
				data: data?.infoList.map((item: any) => item.num),
				itemStyle: {
					color: '#00A7FA'
				}
			},
			{
				name: '告警',
				type: 'line',
				symbol: 'none',
				data: data?.warningList.map((item: any) => item.num),
				itemStyle: {
					color: '#FAA700'
				}
			},
			{
				name: '严重',
				type: 'line',
				symbol: 'none',
				data: data?.criticalList.map((item: any) => item.num),
				itemStyle: {
					color: '#FF4D4F'
				}
			}
		]
	};

	return option;
};

export { getPieOption, getLineOption };
