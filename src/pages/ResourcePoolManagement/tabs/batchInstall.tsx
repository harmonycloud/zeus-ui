import React, { useState } from 'react';
import { Dialog, Checkbox, Radio } from '@alicloud/console-components';
import { name, color, icon } from '@/components/ComponentCard/index';
import { ComponentProp } from '../resource.pool';
import CustomIcon from '@/components/CustomIcon';

interface BatchInstallProps {
	visible: boolean;
	onCancel: () => void;
	components: ComponentProp[];
	clusterId: string;
}

const { Group: RadioGroup } = Radio;
const BatchInstall = (props: BatchInstallProps) => {
	const { visible, onCancel, components, clusterId } = props;
	const [data, setData] = useState<ComponentProp[]>(components);
	const [componentCheck, setComponentCheck] = useState<boolean>(false);
	const [controllerCheck, setControllerCheck] = useState<boolean>(false);
	const onOk = () => {
		console.log('on ok');
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
				<div>
					<Checkbox label="全选" checked={componentCheck} />
				</div>
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
					<Checkbox label="全选" checked={controllerCheck} />
				</div>
			</div>
		</Dialog>
	);
};
export default BatchInstall;
