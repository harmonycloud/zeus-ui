import React, { useEffect, useState } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { useParams, useHistory } from 'react-router';
import { Button, notification, Space, Input } from 'antd';
import FormBlock from '@/components/FormBlock';
import { getUsableNodes, divideArea } from '@/services/activeActive';
import { NodeItem } from './activeActive';
import { IconFont } from '@/components/IconFont';

const { Search } = Input;
interface AreaConfigParams {
	id: string;
	areaName: string;
	aliasName: string;
}
export default function AreaConfig(): JSX.Element {
	const params: AreaConfigParams = useParams();
	const history = useHistory();
	const [nodes, setNodes] = useState<NodeItem[]>([]);
	const [showNodes, setShowNodes] = useState<NodeItem[]>([]);
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getUsableNodes({ clusterId: params.id }).then((res) => {
			console.log(res);
			if (res.success) {
				setNodes(
					res.data.map((item: NodeItem) => {
						item.selected = false;
						return item;
					})
				);
				setShowNodes(
					res.data.map((item: NodeItem) => {
						item.selected = false;
						return item;
					})
				);
			}
		});
	};
	const onSearch = (value: string) => {
		const list = nodes.filter((item: NodeItem) => item.ip.includes(value));
		setShowNodes(list);
	};
	const nodeItemClick = (name: string) => {
		const list = nodes.map((item) => {
			if (item.name === name) {
				item.selected = !item.selected;
			}
			return item;
		});
		setNodes(list);
	};
	const handleClick = () => {
		const list = nodes
			.filter((item: NodeItem) => item.selected === true)
			.map((item) => {
				return {
					name: item.name
				};
			});
		const sendData = {
			clusterId: params.id,
			name: params.areaName,
			nodeList: list
		};
		divideArea(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '节点IP分配成功'
				});
				history.goBack();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<ProPage>
			<ProHeader
				title={`${params.aliasName}配置`}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<FormBlock title="新增节点IP">
					<div className="zeus-area-config-content">
						<div className="zeus-area-label-content">
							选择节点IP
						</div>
						<div className="zeus-area-ip-content">
							<div className="zeus-area-search-content">
								<div>待分配节点</div>
								<div>
									<Search
										allowClear={true}
										onSearch={onSearch}
										style={{ width: '250px' }}
									/>
								</div>
							</div>
							<div className="zeus-area-node-content">
								{showNodes.map(
									(item: NodeItem, index: number) => {
										return (
											<div
												key={index}
												className={`zeus-area-node-item ${
													item.selected
														? 'zeus-area-node-item-active'
														: ''
												}`}
												onClick={() =>
													nodeItemClick(item.name)
												}
											>
												<IconFont
													type="icon-yunzhuji"
													style={{
														color: '#888A8C',
														fontSize: 16
													}}
												/>
												<span>IP: {item.ip}</span>
												<IconFont
													type="icon-xuanzhong"
													style={
														item.selected
															? {
																	position:
																		'absolute',
																	right: 0,
																	bottom: 0
															  }
															: {
																	visibility:
																		'hidden'
															  }
													}
												/>
											</div>
										);
									}
								)}
							</div>
						</div>
					</div>
				</FormBlock>
				<Space>
					<Button
						disabled={nodes.every(
							(item) => item.selected === false
						)}
						type="primary"
						onClick={handleClick}
					>
						确定
					</Button>
					<Button
						onClick={() => {
							history.goBack();
						}}
					>
						取消
					</Button>
				</Space>
			</ProContent>
		</ProPage>
	);
}
