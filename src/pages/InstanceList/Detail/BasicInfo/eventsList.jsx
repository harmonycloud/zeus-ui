import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Timeline } from '@alicloud/console-components';
import { Icon } from '@alifd/next';
import { getMiddlewareEvents } from '@/services/middleware.js';
import styles from './basicinfo.module.scss';
import './basicinfo.scss';
import transTime from '@/utils/transTime';
import imgNone from '@/assets/images/nodata.svg';

const successTip = <div className={styles['success-tip']}>正常</div>;

const errorTip = <div className={styles['error-tip']}>异常</div>;

const EventsList = (props) => {
	const { type, middlewareName, eventType, kind, globalVar } = props;
	const [eventList, setEventList] = useState([]);
	const [originEventList, setOriginEventList] = useState([]);

	const getEventsData = async (clusterId, namespace, kind) => {
		let sendData = {
			clusterId,
			namespace,
			middlewareName,
			type
		};
		if (kind) sendData.kind = kind === 'All' ? '' : kind;
		let res = await getMiddlewareEvents(sendData);
		if (res.success) {
			let temp = res.data.map((item) => ({
				...item,
				show: false
			}));
			setOriginEventList(temp);
			setEventList(
				temp.filter((item) => {
					if (eventType === 'All') return true;
					else if (eventType === 'Normal')
						return item.type === 'Normal';
					else return item.type !== 'Normal';
				})
			);
		}
	};

	const eventHander = (item, index) => {
		let tempArr = [...eventList];
		item.show = !item.show;
		tempArr[index] = item;
		setEventList(tempArr);
	};

	useEffect(() => {
		if (
			JSON.stringify(globalVar.cluster) !== '{}' &&
			JSON.stringify(globalVar.namespace) !== '{}'
		) {
			getEventsData(globalVar.cluster.id, globalVar.namespace.name, kind);
		}
	}, [globalVar, kind]);

	useEffect(() => {
		if (eventType) {
			let temp = originEventList.filter((item) => {
				if (eventType === 'All') return true;
				else if (eventType === 'Normal') return item.type === 'Normal';
				else return item.type !== 'Normal';
			});
			setEventList(temp);
		}
	}, [eventType]);

	return (
		<>
			<div className={styles['event-line-box']}>
				{eventList && eventList.length === 0 ? (
					<div className="display-flex flex-column flex-center">
						<img width={140} height={140} src={imgNone} alt="" />
						<p>暂时没有数据</p>
					</div>
				) : null}
				{eventList && (
					<Timeline>
						{eventList.map((item, index) => (
							<Timeline.Item
								key={index}
								dot={
									item.type === 'Normal'
										? successTip
										: errorTip
								}
								className="basic-info-event"
								content={
									<div className={styles['event-content']}>
										<div
											className={`${styles['event-info']} display-flex`}
											onClick={() =>
												eventHander(item, index)
											}
										>
											<div
												className={styles['event-name']}
											>
												<Icon
													type="angle-right"
													size="xs"
													className={`${
														item.show
															? styles['active']
															: null
													}`}
													style={{ marginRight: 18 }}
												/>
												{item.involvedObject && (
													<span>
														{
															item.involvedObject
																.kind
														}
														:{' '}
														{
															item.involvedObject
																.name
														}
													</span>
												)}
												<span
													className={
														styles['normal-tip']
													}
													style={{ marginLeft: 18 }}
												>
													{item.reason}
												</span>
											</div>
											<div
												className={styles['event-time']}
											>
												<span>
													{transTime.gmt2local(
														item.lastTimestamp
													)}
												</span>
											</div>
										</div>
										{item.show ? (
											<div
												className={
													styles['event-message']
												}
											>
												<p>{item.message}</p>
											</div>
										) : null}
									</div>
								}
							/>
						))}
					</Timeline>
				)}
			</div>
		</>
	);
};

export default connect(
	({ globalVar }) => ({
		globalVar
	}),
	null
)(EventsList);
