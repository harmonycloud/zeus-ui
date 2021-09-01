import React, { useState, useEffect } from 'react';
import { Timeline, Balloon } from '@alicloud/console-components';
import { useHistory } from 'react-router-dom';
import './index.scss';
import transTime from '@/utils/transTime';
import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { getNamespaces } from '@/services/common';
import { setCluster, setNamespace } from '@/redux/globalVar/var';

/*
	params
	list:[{time:'',message:'',summary:'',level:''}]
	style:内联样式
	clusters:
	type:'default' 在平台管理页面的告警跳转涉及跨集群跳转
*/

function AlarmTimeLine(props) {
	const { style = {}, list = [], clusters = [], type = 'default' } = props;
	const [data, setData] = useState(list);
	const history = useHistory();
	// props变化时修改list值
	useEffect(() => {
		setData(list);
	}, [props]);
	const dotRender = (value) => {
		return (
			<div className={`${value}-tip`}>
				{value === 'info'
					? '提示'
					: value === 'warning'
					? '告警'
					: '严重'}
			</div>
		);
	};

	// 跨集群跳转
	const getNamespaceList = async (item) => {
		const clusterData = clusters.filter((c) => c.id === item.clusterId)[0];
		setCluster(clusterData);
		storage.setLocal('cluster', JSON.stringify(clusterData));
		let res = await getNamespaces({
			clusterId: item.clusterId,
			withQuota: true
		});
		if (res.success) {
			if (res.data.length > 0) {
				res.data.map((n) => {
					if (n.name === item.namespace) {
						setNamespace(n);
						storage.setLocal('namespace', JSON.stringify(n));
						history.push({
							pathname: `/instanceList/detail/${item.name}/${item.type}/${item.type}/${item.chartVersion}`,
							state: {
								flag: true
							}
						});
					}
				});
			}
		}
	};

	const toDetail = (item) => {
		// console.log(item);
		if (item.chartVersion) {
			console.log(type);
			if (type === 'default') {
				history.push(
					`/instanceList/detail/${item.name}/${item.type}/${item.type}/${item.chartVersion}`
				);
			} else {
				getNamespaceList(item);
			}
		}
	};

	return (
		<div style={style} id="time-line-content">
			<Timeline>
				{data &&
					data.map((item, index) => {
						return (
							<Timeline.Item
								key={index}
								title={
									<span
										className={`time-line-title ${
											item.chartVersion ? 'active' : ''
										}`}
										onClick={() => toDetail(item)}
									>
										{item.name}
									</span>
								}
								dot={dotRender(item.level)}
								content={
									<>
										<div className="time-line-time">
											{transTime.gmt2local(item.time)}
										</div>
										<div className="details-msg">
											<div
												className="details-summary"
												title={item.summary}
											>
												{item.summary}
											</div>
											<Balloon
												alignEdge={true}
												align="t"
												triggerType="hover"
												// followTrigger={true}
												closable={false}
												trigger={
													<span className="details-color">
														详情
													</span>
												}
											>
												{item.message}
											</Balloon>
										</div>
									</>
								}
							/>
						);
					})}
			</Timeline>
		</div>
	);
}
export default connect(() => ({}), {
	setCluster,
	setNamespace
})(AlarmTimeLine);
