import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Radio,
	Message,
	Icon,
	Select
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { useLocation } from 'react-router';
import { getMiddlewareRepository } from '@/services/repository';
import messageConfig from '@/components/messageConfig';
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
import './index.scss';
import { getClusters } from '@/services/common';

const RadioGroup = Radio.Group;
const Option = Select.Option;
function MiddlewareRepository(props: middlewareRepositoryProps): JSX.Element {
	const {
		globalVar: { cluster, namespace, project }
	} = props;
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
				Message.show(messageConfig('error', '失败', res));
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
					Message.show(messageConfig('error', '失败', res));
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
					if (item === null) {
						obj['其他'] = originData.filter((i) => i.type === item);
					} else {
						obj[item] = originData.filter((i) => i.type === item);
					}
				});
			} else {
				list.forEach((item) => {
					if (item === null) {
						obj['其他'] = originData.filter(
							(i) => i.type === item && i.status === 1
						);
					} else {
						obj[item] = originData.filter(
							(i) => i.type === item && i.status === 1
						);
					}
				});
			}

			setDataSource(changeObjectIndex(obj, '其他', list.length - 1));
		} else if (rule === 'source') {
			const obj = {};
			if (location.pathname === '/middlewareRepository') {
				obj['官方'] = originData.filter((i) => i.official === true);
				obj['非官方'] = originData.filter((i) => i.official !== true);
			} else {
				obj['官方'] = originData.filter(
					(i) => i.official === true && i.status === 1
				);
				obj['非官方'] = originData.filter(
					(i) => i.official !== true && i.status === 1
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
				Message.show(messageConfig('error', '失败', res));
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
	if (JSON.stringify(cluster) === '{}') {
		return <GuidePage />;
	}
	return (
		<Page>
			<Header
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
				hasBackArrow={
					location.pathname === '/middlewareRepository' ? false : true
				}
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
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
								autoWidth={false}
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
							dataSource={[
								{ value: 'type', label: '类型' },
								{ value: 'source', label: '来源' }
							]}
							shape="button"
							value={rule}
							onChange={(value) => setRule(value as string)}
						/>
						<div
							className="middleware-repository-refresh-btn"
							onClick={() => {
								if (currentCluster) {
									getData(currentCluster.id);
								}
							}}
						>
							<Icon type="refresh" size="xs" color="#333333" />
						</div>
					</div>
				</div>
				<div className="middleware-repository-list-display">
					{JSON.stringify(dataSource) !== '{}' &&
						Object.keys(dataSource).map((key) => {
							return (
								<div
									key={key}
									className="middleware-repository-list-item"
								>
									<p>{key}</p>
									<div className="middleware-repository-list-content">
										{dataSource[key].map((item) => {
											return (
												<MiddlewareItem
													key={item.id}
													{...item}
													clusterId={cluster.id}
													onRefresh={() => {
														if (currentCluster) {
															setTimer(
																timerClass.countdownTimer(
																	() => {
																		getData(
																			currentCluster.id
																		);
																	},
																	5
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
			</Content>
			{visible && (
				<UploadMiddlewareForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={onCreate}
				/>
			)}
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(MiddlewareRepository);
