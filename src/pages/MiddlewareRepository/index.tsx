import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Radio, RadioChangeEvent, Select, notification } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';

import { useLocation } from 'react-router';
import { getMiddlewareRepository } from '@/services/repository';
import MiddlewareItem from './MiddlewareItem';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
import GuidePage from '../GuidePage';

import { clusterType, StoreState } from '@/types/index';
import {
	middlewareProps,
	middlewareListProps,
	middlewareRepositoryProps
} from './middleware';

import { changeObjectIndex } from '@/utils/utils';
import timerClass from '@/utils/timerClass';
import { getClusters } from '@/services/common';

import './index.scss';

export enum MiddlewareType {
	db = '数据库',
	mq = '消息队列',
	mse = '微服务引擎',
	storage = '存储',
	'null' = '其他'
}

const RadioGroup = Radio.Group;
const Option = Select.Option;
function MiddlewareRepository(props: middlewareRepositoryProps): JSX.Element {
	const [rule, setRule] = useState<string>('');
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareListProps>({});
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [currentCluster, setCurrentCluster] = useState<clusterType>();
	const [visible, setVisible] = useState<boolean>(false);
	const [timer, setTimer] = useState();
	const location = useLocation();
	useEffect(() => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
				setCurrentCluster(res.data[0]);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		let mounted = true;
		if (currentCluster && JSON.stringify(currentCluster) !== '{}') {
			getMiddlewareRepository({
				clusterId: currentCluster.id
			}).then((res) => {
				if (res.success) {
					if (mounted) {
						setOriginData(res.data);
						setRule('type');
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
		return () => {
			mounted = false;
			clearInterval(timer);
		};
	}, [currentCluster]);
	useEffect(() => {
		if (rule === 'type') {
			const list = Array.from(
				new Set(originData.map((item) => item.type))
			);
			const obj = {};
			if (location.pathname === '/middlewareRepository') {
				list.forEach((item) => {
					if (item === null || item === '') {
						obj['其他'] = originData
							.filter((i) => i.type === item)
							.sort(
								(a, b) =>
									a.name.charCodeAt(0) - b.name.charCodeAt(0)
							);
					} else {
						obj[MiddlewareType[item]] = originData
							.filter((i) => i.type === item)
							.sort(
								(a, b) =>
									a.name.charCodeAt(0) - b.name.charCodeAt(0)
							);
					}
				});
			} else {
				list.forEach((item) => {
					if (item === null || item === '') {
						obj['其他'] = originData
							.filter((i) => i.type === item && i.status === 1)
							.sort(
								(a, b) =>
									a.name.charCodeAt(0) - b.name.charCodeAt(0)
							);
					} else {
						obj[MiddlewareType[item]] = originData
							.filter((i) => i.type === item && i.status === 1)
							.sort(
								(a, b) =>
									a.name.charCodeAt(0) - b.name.charCodeAt(0)
							);
					}
				});
			}
			if (!list.includes('')) {
				const ot = changeObjectIndex(obj, '数据库', 0);
				setDataSource(ot);
			} else {
				const ot = changeObjectIndex(obj, '其他', list.length - 1);
				setDataSource(changeObjectIndex(ot, '数据库', 0));
			}
		} else if (rule === 'source') {
			const obj = {};
			if (location.pathname === '/middlewareRepository') {
				obj['官方'] = originData
					.filter((i) => i.official === true)
					.sort(
						(a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0)
					);
				obj['非官方'] = originData
					.filter((i) => i.official !== true)
					.sort(
						(a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0)
					);
			} else {
				obj['官方'] = originData
					.filter((i) => i.official === true && i.status === 1)
					.sort(
						(a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0)
					);
				obj['非官方'] = originData
					.filter((i) => i.official !== true && i.status === 1)
					.sort(
						(a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0)
					);
			}
			setDataSource(obj);
		}
	}, [rule, originData]);
	const getData = (clusterId: string) => {
		getMiddlewareRepository({
			clusterId: clusterId
		}).then((res) => {
			if (res.success) {
				setOriginData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onCreate = () => {
		setVisible(false);
		if (currentCluster) {
			setTimer(
				timerClass.countdownTimer(() => {
					getData(currentCluster?.id);
				}, 5)
			);
		}
	};
	const onChange = (value: string) => {
		const ct = clusterList.find((item) => item.id === value);
		setCurrentCluster(ct);
	};
	if (JSON.stringify(currentCluster) === '{}') {
		return <GuidePage />;
	}
	return (
		<ProPage>
			<ProHeader
				title={
					location.pathname === '/middlewareRepository'
						? '中间件市场'
						: '发布服务'
				}
				subTitle={
					location.pathname === '/middlewareRepository'
						? '不同类型中间件上/下架、升级管理等'
						: '不同类型中间件发布服务'
				}
				backIcon={
					location.pathname === '/middlewareRepository' ? false : true
				}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				{location.pathname === '/middlewareRepository' ? (
					<div className="middleware-repository-tips">
						自定义上架中间件，请参考
						<span
							className="name-link"
							onClick={() => {
								window.open(
									'https://zeusharmonycloud.yuque.com/docs/share/b1cd76ac-08c8-481d-9dc7-d38565505bc7?#'
								);
							}}
						>
							《自定义开发，上架中间件规范说明》
						</span>
					</div>
				) : null}
				<div className="middleware-repository-action-layout">
					{location.pathname === '/middlewareRepository' ? (
						<div>
							<Button
								type="primary"
								onClick={() => setVisible(true)}
								style={{ marginRight: 8 }}
							>
								上架中间件
							</Button>
							<span style={{ marginLeft: 16 }}>集群：</span>
							<Select
								onChange={onChange}
								value={currentCluster?.id}
							>
								{clusterList.map((item: clusterType) => {
									return (
										<Option value={item.id} key={item.id}>
											{item.nickname}
										</Option>
									);
								})}
							</Select>
						</div>
					) : (
						<div></div>
					)}
					<div className="middleware-repository-right-layout">
						<RadioGroup
							options={[
								{ value: 'type', label: '类型' },
								{ value: 'source', label: '来源' }
							]}
							optionType="button"
							value={rule}
							onChange={(e: RadioChangeEvent) =>
								setRule(e.target.value)
							}
						/>
						<div
							className="middleware-repository-refresh-btn"
							onClick={() => {
								if (currentCluster) {
									getData(currentCluster.id);
								}
							}}
						>
							<ReloadOutlined style={{ color: '#252525' }} />
						</div>
					</div>
				</div>
				<div className="middleware-repository-list-display">
					{JSON.stringify(dataSource) !== '{}' &&
						currentCluster &&
						Object.keys(dataSource).map((key) => {
							return (
								<div
									key={key}
									className="middleware-repository-list-item"
								>
									<p>{key}</p>
									<div className="middleware-repository-list-content">
										{dataSource[key]?.map((item) => {
											return (
												<MiddlewareItem
													key={item.id}
													{...item}
													clusterId={
														currentCluster.id
													}
													onRefresh={() => {
														if (currentCluster) {
															setTimer(
																timerClass.countdownTimer(
																	() => {
																		getData(
																			currentCluster.id
																		);
																	},
																	3
																)
															);
														}
													}}
												/>
											);
										})}
									</div>
								</div>
							);
						})}
				</div>
			</ProContent>
			{visible && (
				<UploadMiddlewareForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={onCreate}
				/>
			)}
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(MiddlewareRepository);
