import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useHistory } from 'react-router-dom';
import storage from '@/utils/storage';
import { connect } from 'react-redux';

import { getNamespaces } from '@/services/common';
import { setCluster, setNamespace } from '@/redux/globalVar/var';
import otherColor from '@/assets/images/nodata.svg';
import { api } from '@/api.json';
// 限制图表元素标签的长度
function labelFormat(params) {
	return params.name.length > 4
		? params.name.slice(0, 4) + '...'
		: params.name;
}

function ExampleCharts(props) {
	const history = useHistory();
	const [option, setOption] = useState({
		tooltip: {
			trigger: 'item',
			backgroundColor: '#fff',
			textStyle: {
				color: '#000'
			},
			padding: 0,
			extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
			formatter: function (params) {
				let res = '';
				switch (params.data.dataType) {
					case 'cluster':
						res = `<div style='border: 1px solid #D1D5D9;line-height: 24px;font-size: 12px;color: rgba(0, 0, 0, 0.85);'>
							<div style='height: 40px;display:flex; align-items:center;background-color: rgb(245,245,245);padding: 0 16px;font-weight: 500;font-family: PingFangSC-Medium, PingFang SC;'>集群：${params.name}</div>
							<div style='padding:10px 16px;font-family: PingFangSC-Regular, PingFang SC;font-weight: 400;'>
								<p>注册命名空间数：${params.data.regNamespaceCount}</p>
								<p>中间件服务数：${params.data.instanceCount}</p>
							</div>
						</div>`;
						break;
					case 'namespace':
						res = `<div style='border: 1px solid #D1D5D9;line-height: 24px;font-size: 12px;color: rgba(0, 0, 0, 0.85);'>
							<div style='height: 40px;display:flex; align-items:center;background-color: rgb(245,245,245);padding: 0 16px;font-weight: 500;font-family: PingFangSC-Medium, PingFang SC;'>命名空间：${
								params.name
							}</div>
							<div style='padding:10px 16px;font-family: PingFangSC-Regular, PingFang SC;font-weight: 400;'>
								<p>服务数：
									<span style='color: ${
										params.data.instanceExceptionCount > 0
											? 'red'
											: '#000'
									}' >
									${params.data.instanceCount}
								</p>
								<p>CPU配额：${params.data.cpu}Core</p>
								<p>内存配额： ${params.data.memory}GiB</p>
							</div>
						</div>`;
						break;
					case 'node':
						res = `<div style='border: 1px solid #D1D5D9;line-height: 24px;font-size: 12px;color: rgba(0, 0, 0, 0.85);'>
							<div style='padding: 4px 9px;height: 40px;display:flex; align-items:center;background-color: rgb(245,245,245);font-weight: 500;font-family: PingFangSC-Medium, PingFang SC;'>
								<img src=${
									params.data.imagePath
										? `${api}/images/middleware/${params.data.imagePath}`
										: otherColor
								} style='height:80%;margin-right:10px;border-radius: 50%;'/>
								${params.name}
							</div>
							<div style='padding:10px 16px;font-family: PingFangSC-Regular, PingFang SC;font-weight: 400;'>
								<p>节点数：${params.data.nodeCount}</p>
								<p>总CPU：${params.data.totalCpu}Core</p>
								<p>总内存：${params.data.totalMemory}GiB</p>
								<p>状态: <span style='color: ${params.data.status ? 'black' : 'red'}'>
									${params.data.status ? '正常' : '异常'}
								</p>
							</div>
						</div>`;
						break;
				}
				return res;
			}
		},
		series: {
			type: 'sunburst',
			data: [],
			radius: ['10%', '100%'],
			label: {
				rotate: 'radial',
				color: '#000',
				formatter: labelFormat
			},
			levels: [
				{
					itemStyle: {
						color: '#5c7b9d'
					}
				}
			]
		}
	});
	// 跨集群跳转
	const getNamespaceList = async (clusterId, namespace, params) => {
		const clusterData = props.clusters.filter(
			(item) => item.id === clusterId
		)[0];
		setCluster(clusterData);
		storage.setLocal('cluster', JSON.stringify(clusterData));

		let res = await getNamespaces({ clusterId, withQuota: true });
		if (res.success) {
			if (res.data.length > 0) {
				res.data.map((item) => {
					if (item.name === namespace) {
						setNamespace(item);
						storage.setLocal('namespace', JSON.stringify(item));
						if (params.data.chartName && params.data.chartVersion) {
							// 详情跳转
							history.push({
								pathname: `/instanceList/detail/${params.name}/${params.data.type}/${params.data.chartVersion}`,
								state: {
									flag: true
								}
							});
						}
					}
				});
			}
		}
	};

	useEffect(() => {
		setOption({
			...option,
			series: {
				...option.series,
				data: props.chartData
			}
		});
	}, [props]);

	const onEvents = {
		click(params) {
			getNamespaceList(
				params.data.cluster,
				params.data.namespace,
				params
			);
		}
	};

	return (
		<ReactEcharts
			option={option}
			onEvents={onEvents}
			style={{ width: '100%', height: '100%' }}
		/>
	);
}
export default connect(() => ({}), {
	setCluster,
	setNamespace
})(ExampleCharts);
