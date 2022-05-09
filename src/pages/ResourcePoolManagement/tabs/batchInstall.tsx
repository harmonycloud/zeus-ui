import React, { useEffect, useState } from 'react';
import { Modal, Checkbox, Radio, notification, RadioChangeEvent } from 'antd';
import { name, icon, color, labelSimple, labelHigh } from '@/utils/enum';
import { ComponentProp } from '../resource.pool';
import { getMiddlewareRepository } from '@/services/repository';
import CustomIcon from '@/components/CustomIcon';
import { mulInstallComponent } from '@/services/common';
import { api } from '@/api.json';

interface BatchInstallProps {
	visible: boolean;
	onCancel: () => void;
	components: ComponentProp[];
	clusterId: string;
	onRefresh: () => void;
}
interface ControllerItemProps {
	chartName: string;
	chartVersion: string;
	status: number;
	type?: any;
}
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;
const BatchInstall = (props: BatchInstallProps) => {
	const { visible, onCancel, components, clusterId, onRefresh } = props;
	const [data, setData] = useState<ComponentProp[]>(
		components.filter((item) => item.component !== 'lvm')
	);
	const [controllers, setControllers] = useState<ControllerItemProps[]>([]);
	const [selectController, setSelectController] = useState<
		ControllerItemProps[]
	>([]);
	useEffect(() => {
		getMiddlewareRepository({ clusterId }).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					const list = res.data.map((item: any) => {
						const result: ControllerItemProps = {
							chartName: item.chartName,
							chartVersion: item.chartVersion,
							status: item.status,
							type: item.replicas > 1 ? 'high' : 'simple'
						};
						return result;
					});
					setControllers(list);
				} else {
					setControllers([]);
				}
			} else {
				setControllers([]);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	const onOk = () => {
		const componentList = data
			.filter((i) => i.status === 0)
			.filter((j) => {
				if (!(j.component === 'local-path' && j.type === 'false')) {
					return j;
				}
			})
			.map((f) => {
				if (f.type === null) {
					f.type = 'simple';
				}
				if (f.component === 'grafana') {
					f.protocol =
						window.location.protocol.toLowerCase() === 'https:'
							? 'https'
							: 'http';
				}
				return f;
			});
		const controllerList = controllers
			.filter((i) => i.status === 2)
			.map((f) => {
				if (f.type === null) {
					f.type = 'simple';
				}
				return {
					chartName: f.chartName,
					chartVersion: f.chartVersion,
					type: f.type
				};
			});
		const sendData = {
			clusterId,
			clusterComponentsDtoList: componentList,
			middlewareInfoDTOList: controllerList
		};
		mulInstallComponent(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '组件批量安装成功'
				});
				onRefresh();
				onCancel();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const componentChange = (
		value: string | number | boolean,
		record: ComponentProp
	) => {
		const listTemp = data.map((item) => {
			if (item.component === record.component) {
				item.type = value as string;
			}
			return item;
		});
		setData(listTemp);
	};
	const operatorChange = (
		value: string | number | boolean,
		record: ControllerItemProps
	) => {
		const listTemp = controllers.map((item) => {
			if (item.chartName === record.chartName) {
				item.type = value as string;
			}
			return item;
		});
		setSelectController(listTemp);
	};
	return (
		<Modal
			title="批量安装"
			visible={visible}
			width={715}
			onCancel={onCancel}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
		>
			<div className="batch-install-title-content">
				<div className="batch-install-name">平台组件</div>
			</div>
			{data.map((item: ComponentProp) => {
				return (
					<div
						className="batch-install-component-item"
						key={item.component}
					>
						<div className="batch-install-component-title">
							<div
								className="batch-install-component-title-icon"
								style={{
									backgroundColor: color[item.component]
								}}
							>
								<CustomIcon
									type={icon[item.component]}
									style={{
										color: '#FFFFFF',
										width: 30,
										fontSize: 30
									}}
								/>
							</div>
							<div className="batch-install-component-title-info">
								<div className="batch-install-component-title-name">
									{name[item.component]}
								</div>
								{item.status !== 0 ? (
									<div
										className="batch-install-component-status-tag"
										style={
											item.status === 1
												? {
														backgroundColor:
															'#C7ECFF',
														color: '#00A7FA'
												  }
												: {
														backgroundColor:
															'#F6FFED',
														color: '#52C41A'
												  }
										}
									>
										{item.status === 1
											? '已接入'
											: '已安装'}
									</div>
								) : null}
							</div>
						</div>
						{item.component !== 'local-path' &&
						item.component !== 'ingress' ? (
							<div>
								<RadioGroup
									defaultValue={'simple'}
									disabled={item.status !== 0}
									onChange={(e: RadioChangeEvent) =>
										componentChange(e.target.value, item)
									}
								>
									<Radio id="simple" value="simple">
										{`单实例版：${
											labelSimple[item.component]
										}`}
									</Radio>
									<br />
									<Radio id="high" value="high">
										{`高实例版：${
											labelHigh[item.component]
										}`}
									</Radio>
								</RadioGroup>
							</div>
						) : (
							<div>
								<RadioGroup
									defaultValue={'true'}
									disabled={item.status !== 0}
									onChange={(e: RadioChangeEvent) =>
										componentChange(e.target.value, item)
									}
								>
									<Radio id="true" value="true">
										安装
									</Radio>
									<br />
									<Radio id="false" value="false">
										不安装
									</Radio>
								</RadioGroup>
							</div>
						)}
					</div>
				);
			})}
			<div
				className="batch-install-title-content"
				style={{ marginTop: 24 }}
			>
				<div className="batch-install-name">中间件控制器</div>
			</div>
			{controllers.length === 0 && (
				<p style={{ textAlign: 'center' }}>无可安装的中间件控制器</p>
			)}
			<div style={{ height: 'auto' }}>
				{controllers.map((item: ControllerItemProps, index: number) => {
					return (
						<div
							className="batch-install-component-item"
							key={item.chartName}
						>
							<div className="batch-install-component-title">
								<div className="batch-install-component-title-icon operator">
									<img
										height={30}
										width={30}
										src={`${api}/images/middleware/${item.chartName}-${item.chartVersion}.svg`}
									/>
								</div>
								<div className="batch-install-component-title-info">
									<div className="batch-install-component-title-name">
										{item.chartName +
											' | ' +
											item.chartVersion}
									</div>
									{item.status === 1 ? (
										<div
											className="batch-install-component-status-tag"
											style={{
												backgroundColor: '#F6FFED',
												color: '#52C41A'
											}}
										>
											已安装
										</div>
									) : null}
								</div>
							</div>
							<div>
								<RadioGroup
									defaultValue={item.type}
									disabled={item.status !== 2}
									onChange={(e: RadioChangeEvent) =>
										operatorChange(e.target.value, item)
									}
								>
									<Radio id="simple" value="simple">
										单实例版
									</Radio>
									<br />
									<Radio id="high" value="high">
										高实例版
									</Radio>
								</RadioGroup>
							</div>
						</div>
					);
				})}
			</div>
		</Modal>
	);
};
export default BatchInstall;
