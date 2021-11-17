import React, { useEffect, useState } from 'react';
import { Dialog, Checkbox, Radio, Message } from '@alicloud/console-components';
import { name, color, icon } from '@/components/ComponentCard/index';
import { ComponentProp } from '../resource.pool';
import { getMiddlewareRepository } from '@/services/repository';
import CustomIcon from '@/components/CustomIcon';
import messageConfig from '@/components/messageConfig';
import { mulInstallComponent } from '@/services/common';

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
}
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;
const BatchInstall = (props: BatchInstallProps) => {
	const { visible, onCancel, components, clusterId, onRefresh } = props;
	const [data, setData] = useState<ComponentProp[]>(components);
	const [controllers, setControllers] = useState<ControllerItemProps[]>([]);
	const [controllerCheck, setControllerCheck] = useState<boolean>(false);
	const [selectController, setSelectController] = useState<string[]>([]);
	useEffect(() => {
		getMiddlewareRepository({ clusterId }).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					const list = res.data
						.filter((item: any) => item.status === 2)
						.map((item: any) => {
							const result: ControllerItemProps = {
								chartName: item.chartName,
								chartVersion: item.chartVersion
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
			.map((f) => {
				if (f.type === null) {
					f.type = 'simple';
				}
				return f;
			});
		const controllerList = selectController.map((item) => {
			return controllers.find((i) => i.chartName === item);
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
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const onChange = (value: string[]) => {
		setSelectController(value);
		if (value.length === controllers.length) {
			setControllerCheck(true);
		} else {
			setControllerCheck(false);
		}
	};
	const allControllerSelect = (checked: boolean) => {
		setControllerCheck(checked);
		if (checked) {
			setSelectController(
				controllers.map((item: ControllerItemProps) => item.chartName)
			);
		} else {
			setSelectController([]);
		}
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
						item.component !== 'middleware-controller' ? (
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
										label="单实例版：cpu：**核；内存：***G；存储：****G"
									/>
									<br />
									<Radio
										id="high"
										value="high"
										label="高可用版：cpu：**核；内存：***G；存储：****G"
									/>
								</RadioGroup>
							</div>
						) : (
							<div>
								<RadioGroup
									defaultValue={'true'}
									disabled={item.status !== 0}
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
				<div>
					<Checkbox
						label="全选"
						checked={controllerCheck}
						onChange={allControllerSelect}
					/>
				</div>
			</div>
			<CheckboxGroup value={selectController} onChange={onChange}>
				{controllers.map((item: ControllerItemProps, index: number) => {
					return (
						<Checkbox key={index} value={item.chartName}>
							{item.chartName}|{item.chartVersion}
						</Checkbox>
					);
				})}
			</CheckboxGroup>
		</Dialog>
	);
};
export default BatchInstall;
