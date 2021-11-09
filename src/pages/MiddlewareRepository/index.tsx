import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Radio, Message, Icon } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { useLocation } from 'react-router';
import { getMiddlewareRepository } from '@/services/repository';
import { StoreState, globalVarProps } from '@/types/index';
import { middlewareProps, middlewareListProps } from './middleware';
import timerClass from '@/utils/timerClass';
import messageConfig from '@/components/messageConfig';
import MiddlewareItem from './MiddlewareItem';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
import { changeObjectIndex } from '@/utils/utils';
import './index.scss';

const RadioGroup = Radio.Group;
interface middlewareRepositoryProps {
	globalVar: globalVarProps;
}
function MiddlewareRepository(props: middlewareRepositoryProps): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const [rule, setRule] = useState<string>('');
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareListProps>({});
	const [visible, setVisible] = useState<boolean>(false);
	const [timer, setTimer] = useState();
	const location = useLocation();
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			getMiddlewareRepository({
				clusterId: cluster.id,
				namespace: namespace.name
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
	}, [namespace, location.pathname]);
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
	const getData = () => {
		getMiddlewareRepository({
			clusterId: cluster.id,
			namespace: namespace.name
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
		setTimer(
			timerClass.countdownTimer(() => {
				getData();
			}, 5)
		);
	};
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
									'https://harmonycloudcaas.yuque.com/acntg9/wbcthn/msdsob'
								);
							}}
						>
							《自定义开发，上架中间件规范说明》
						</span>
					</div>
				) : null}
				<div className="middleware-repository-action-layout">
					{location.pathname === '/middlewareRepository' ? (
						<Button type="primary" onClick={() => setVisible(true)}>
							上架中间件
						</Button>
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
							onClick={getData}
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
														setTimer(
															timerClass.countdownTimer(
																() => {
																	getData();
																},
																5
															)
														);
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
