import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import './resourceCharts.scss';

export default function ResourceCharts(props) {
	const { data } = props;
	const [option, setOption] = useState({
		color: ['#0064C8', '#5CCDBB', '#FAD368'],
		title: {
			left: 'left',
			align: 'right',
			textStyle: {
				fontFamily: 'PingFangSC-Semibold, PingFang SC',
				fontWeight: 600,
				color: '#333333'
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			splitLine: {
				show: false
			}
		},
		legend: {
			data: ['CPU', '内存', '存储'],
			icon: 'circle',
			left: 10
		},
		yAxis: {
			type: 'value',
			name: '使用率(%)',
			splitLine: {
				show: true,
				lineStyle: {
					type: 'dashed'
				}
			}
		},
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(255, 255, 255, 0.8)',
			padding: [11, 17],
			formatter: function (params) {
				let htmlStr =
					'<div style="width:188px;height:115px;border-radius:2px;">';
				for (let i = 0; i < params.length; i++) {
					const param = params[i];
					const xName = param.name; //x轴的名称
					const data = param.data; //data值
					const color = param.color; //图例颜色
					if (i === 0) {
						htmlStr +=
							'<div style="margin-bottom:12px;color:' +
							'rgba(0, 0, 0, 0.45)' +
							'">' +
							xName +
							'</div>'; //x轴的名称
					}
					htmlStr += '<div style="color:' + '#000000;' + '">';
					htmlStr +=
						'<span style="margin-right:10px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
						color +
						';"></span>';
					if (i === 0) {
						htmlStr +=
							'<span style="margin-right:12px;">CPU:' +
								'</span>' +
								'<span>' +
								data.data.cpu ===
							null
								? '无'
								: data.data.cpu + ' m</span>';
					}
					if (i === 1) {
						htmlStr +=
							'<span style="margin-right:12px;">内存:' +
								'</span>' +
								'<span>' +
								data.data.memory ===
							null
								? '无'
								: data.data.memory + ' MB</span>';
					}
					if (i === 2) {
						htmlStr +=
							'<span style="margin-right:12px;">存储:' +
								'</span>' +
								'<span>' +
								data.data.storage ===
							null
								? '无'
								: data.data.storage + ' GB</span>';
					}
					htmlStr += '</div>';
				}
				htmlStr += '</div>';
				return htmlStr;
			}
		},
		series: []
	});

	useEffect(() => {
		setOption({
			...option,
			series: data || []
		});
	}, [data]);

	return (
		<ReactEcharts
			option={option}
			className="echarts"
			style={{ width: '100%', height: 440 }}
		/>
	);
}
