import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Radio, Message } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { getMiddlewareRepository } from '@/services/repository';
import { StoreState, globalVarProps } from '@/types/index';
import { middlewareProps, middlewareListProps } from './middleware';
import timerClass from '@/utils/timerClass';
import messageConfig from '@/components/messageConfig';
import MiddlewareItem from './MiddlewareItem';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
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

	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			getMiddlewareRepository({
				clusterId: cluster.id,
				namespace: namespace.name
			}).then((res) => {
				console.log(res);
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
	}, [namespace]);
	useEffect(() => {
		if (rule === 'type') {
			const list = Array.from(
				new Set(originData.map((item) => item.type))
			);
			console.log(list);
			const obj = {};
			list.forEach((item) => {
				if (item === null) {
					obj['其他'] = originData.filter((i) => i.type === item);
				} else {
					obj[item] = originData.filter((i) => i.type === item);
				}
			});
			setDataSource(obj);
		} else if (rule === 'source') {
			console.log(originData);
			const obj = {};
			obj['官方'] = originData.filter((i) => i.official === true);
			obj['非官方'] = originData.filter((i) => i.official !== true);
			setDataSource(obj);
		}
	}, [rule]);
	const getData = () => {
		getMiddlewareRepository({
			clusterId: cluster.id,
			namespace: namespace.name
		}).then((res) => {
			console.log(res);
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
			}, 3)
		);
	};
	return (
		<Page>
			<Header
				title="中间件市场"
				subTitle="不同类型中间件上/下架、升级管理等"
			/>
			<Content>
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
				<div className="middleware-repository-action-layout">
					<Button type="primary" onClick={() => setVisible(true)}>
						上架中间件
					</Button>
					<RadioGroup
						dataSource={[
							{ value: 'type', label: '类型' },
							{ value: 'source', label: '来源' }
						]}
						shape="button"
						size="large"
						value={rule}
						onChange={(value) => setRule(value as string)}
					/>
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
