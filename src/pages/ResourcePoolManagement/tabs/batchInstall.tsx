import React, { useEffect, useState } from 'react';
import { Dialog, Checkbox, Radio, Message } from '@alicloud/console-components';
import { name, color, icon } from '@/components/ComponentCard/index';
import { ComponentProp } from '../resource.pool';
import { getMiddlewareRepository } from '@/services/repository';
import CustomIcon from '@/components/CustomIcon';
import messageConfig from '@/components/messageConfig';
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
export enum labelSimple {
	alertmanager = 'cpu：0.2核；内存：0.5G；存储：0G',
	prometheus = 'cpu：1核；内存：2G；存储：10G',
	logging = 'cpu：2.5核；内存：7G；存储：5G',
	minio = 'cpu：0.5核；内存：1G；存储：20G',
	grafana = 'cpu：1核；内存：1G；存储：0G',
	'middleware-controller' = 'cpu：0.5核；内存：0.5G；存储：0G'
}
export enum labelHigh {
	alertmanager = 'cpu：0.6核；内存：1.5G；存储：0G',
	prometheus = 'cpu：3核；内存：6G；存储：30G',
	logging = 'cpu：4.5核；内存：15G；存储：15G',
	minio = 'cpu：1.5核；内存：3G；存储：30G',
	grafana = 'cpu：3核；内存：3G；存储：0G',
	'middleware-controller' = 'cpu：1.5核；内存：1.5G；存储：0G'
}
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;
const BatchInstall = (props: BatchInstallProps) => {
	const { visible, onCancel, components, clusterId, onRefresh } = props;
	const [data, setData] = useState<ComponentProp[]>(
		components.filter((item) => item.component !== 'lvm')
	);
	const [controllers, setControllers] = useState<ControllerItemProps[]>([]);
	const [controllerCheck, setControllerCheck] = useState<boolean>(false);
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
				Message.show(messageConfig('error', '失败', res));
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
				Message.show(
					messageConfig('success', '成功', '组件批量安装成功')
				);
				onRefresh();
				onCancel();
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// const onChange = (value: string[]) => {
	// 	setSelectController(value);
	// 	if (value.length === controllers.length) {
	// 		setControllerCheck(true);
	// 	} else {
	// 		setControllerCheck(false);
	// 	}
	// };
	// const allControllerSelect = (checked: boolean) => {
	// 	setControllerCheck(checked);
	// 	if (checked) {
	// 		setSelectController(
	// 			controllers.map((item: ControllerItemProps) => item.chartName)
	// 		);
	// 	} else {
	// 		setSelectController([]);
	// 	}
	// };
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
		<Dialog
			title="批量安装"
			visible={visible}
			onClose={onCancel}
			onCancel={onCancel}
			onOk={onOk}
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
									onChange={(
										value: string | number | boolean
									) => componentChange(value, item)}
								>
									<Radio
										id="simple"
										value="simple"
										label={`单实例版：${
											labelSimple[item.component]
										}`}
									/>
									<br />
									<Radio
										id="high"
										value="high"
										label={`高实例版：${
											labelHigh[item.component]
										}`}
									/>
								</RadioGroup>
							</div>
						) : (
							<div>
								<RadioGroup
									defaultValue={'true'}
									disabled={item.status !== 0}
									onChange={(
										value: string | number | boolean
									) => componentChange(value, item)}
								>
									<Radio
										id="true"
										value="true"
										label="安装"
									/>
									<br />
									<Radio
										id="false"
										value="false"
										label="不安装"
									/>
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
				{/* <div>
					<Checkbox
						label="全选"
						checked={controllerCheck}
						onChange={allControllerSelect}
					/>
				</div> */}
			</div>
			{controllers.length === 0 && (
				<p style={{ textAlign: 'center' }}>无可安装的中间件控制器</p>
			)}
			<div style={{ height: 'auto' }}>
				{/* <CheckboxGroup
					value={selectController}
					onChange={onChange}
					style={{ width: '100%' }}
				> */}
				{controllers.map((item: ControllerItemProps, index: number) => {
					return (
						// <Checkbox
						// 	key={index}
						// 	value={item.chartName}
						// 	style={{
						// 		display: 'inline-block',
						// 		width: '31%'
						// 	}}
						// >
						// 	{item.chartName}|{item.chartVersion}
						// </Checkbox>
						<div
							className="batch-install-component-item"
							key={item.chartName}
						>
							<div className="batch-install-component-title">
								<div
									className="batch-install-component-title-icon operator"
									style={
										{
											// backgroundColor: color[item.component]
										}
									}
								>
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
									onChange={(
										value: string | number | boolean
									) => operatorChange(value, item)}
								>
									<Radio
										id="simple"
										value="simple"
										label={`单实例版`}
									/>
									<br />
									<Radio
										id="high"
										value="high"
										label={`高实例版`}
									/>
								</RadioGroup>
							</div>
						</div>
					);
				})}
				{/* </CheckboxGroup> */}
			</div>
		</Dialog>
	);
};
export default BatchInstall;
