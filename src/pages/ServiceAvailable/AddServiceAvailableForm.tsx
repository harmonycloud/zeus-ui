import React, { useState, useEffect } from 'react';
import SlidePanel from '@alicloud/console-components-slide-panel';
import {
	Form,
	Select,
	Input,
	Field,
	Message,
	CascaderSelect
} from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import { getServices } from '@/services/ingress';
import pattern from '@/utils/pattern';
import { clusterType } from '@/types';
import { getList } from '@/services/serviceList';
import { serviceListItemProps } from '@/pages/ServiceList/service.list';
import { filtersProps } from '@/types/comment';
import { getIngresses } from '@/services/common';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/ingressForm';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 14
	}
};
interface addServiceAvailableProps {
	visible: boolean;
	onCancel: () => void;
	onCreate: (value: any) => void;
	cluster: clusterType;
	namespace: string;
	middlewareName: string;
}
export default function AddServiceAvailableForm(
	props: addServiceAvailableProps
): JSX.Element {
	console.log(props);
	const { visible, onCancel, cluster, onCreate, namespace, middlewareName } =
		props;
	const [isProcessing, setIsProcessing] = useState(false); // 确认按钮 loading
	const [exposedWay, setExposedWay] = useState('Ingress');
	const [protocol, setProtocol] = useState(
		exposedWay === 'Ingress' ? 'HTTP' : 'TCP'
	);
	const [selectedInstance, setSelectedInstance] = useState({
		name: '',
		type: ''
	});
	const [services, setServices] = useState([]);
	const [selectedService, setSelectedService] = useState({
		serviceName: '',
		portDetailDtoList: []
	});
	const [ingressTcpFlag] = useState(cluster.ingressList || false);
	const [data, setData] = useState([]);
	const [current, setCurrent] = useState<string>();
	const [ingresses, setIngresses] = useState([]);
	const field = Field.useField();
	useEffect(() => {
		if (JSON.stringify(namespace) !== '{}') {
			getList({
				clusterId: cluster.id,
				namespace: namespace,
				keyword: ''
			}).then((res) => {
				if (res.success) {
					const list = res.data.map((item: serviceListItemProps) => {
						const result: filtersProps = {
							value: item.chartName,
							label: item.name,
							children: item.serviceList.map((i) => {
								return {
									label: i.aliasName || i.name,
									value: i.name,
									isLeaf: true
								};
							})
						};
						return result;
					});
					setData(list);
					setCurrent(
						middlewareName === ''
							? list[0].children[0].value
							: middlewareName
					);
					const listTemp = list.filter((item: filtersProps) => {
						let flag = false;
						item.children &&
							item.children.length > 0 &&
							item.children.map((i: filtersProps) => {
								if (i.value === middlewareName) {
									flag = true;
									return i;
								}
							});
						if (flag) {
							return item;
						}
					});
					const selectedInstanceTemp = {
						name:
							middlewareName === ''
								? list[0].children[0].value
								: middlewareName,
						type:
							middlewareName === ''
								? list[0].value
								: listTemp[0].value
					};
					setSelectedInstance(selectedInstanceTemp);
					getExposedService(
						selectedInstanceTemp.name,
						selectedInstanceTemp.type
					);
				}
			});
			getIngresses({ clusterId: cluster.id }).then((res) => {
				if (res.success) {
					setIngresses(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, [namespace, cluster]);
	const onChange = (value: string) => {
		setExposedWay(value);
		value === 'NodePort' ? setProtocol('TCP') : setProtocol('HTTP');
	};

	const onProtocolChange = (value: string) => {
		setProtocol(value);
	};

	const handleChange = (value: string | string[], data: any, extra: any) => {
		setCurrent(value as string);
		setSelectedInstance({
			name: value as string,
			type: extra.selectedPath[0].value
		});
		getExposedService(value as string, extra.selectedPath[0].value);
	};

	const getExposedService = (midName: string, type: string) => {
		const sendData = {
			clusterId: cluster.id,
			namespace: namespace,
			middlewareName: midName,
			middlewareType: type
		};
		getServices(sendData).then((res) => {
			if (res.success) {
				setServices(res.data);
				setSelectedService(res.data[0]);
				// setServicePorts(res.data[0].portDetailDtoList);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const onServiceChange = (value: string) => {
		const list = services.filter((item: any) => item.serviceName === value);
		setSelectedService(list[0]);
	};
	const onOk = () => {
		field.validate((err, data) => {
			if (!err) {
				setIsProcessing(true);
				setIsProcessing(false);
				const value = {
					...data,
					selectedInstance,
					selectedService
				};
				onCreate(value);
			}
		});
	};

	return (
		<SlidePanel
			top={48}
			title="暴露服务"
			okText="提交"
			isShowing={visible}
			width="medium"
			onMaskClick={() => {
				// * 点击蒙版关闭抽屉
				onCancel();
			}}
			onClose={() => {
				onCancel();
			}}
			onCancel={() => {
				onCancel();
			}}
			onOk={onOk}
			isProcessing={isProcessing}
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="选择服务"
					required
					labelTextAlign="left"
					requiredMessage="请选择服务名称！"
					asterisk={false}
					className="ne-required-ingress"
				>
					<CascaderSelect
						listStyle={{ width: '170px' }}
						style={{ width: '100%' }}
						value={current}
						dataSource={data}
						onChange={handleChange}
					/>
				</FormItem>
				<FormItem
					label="暴露方式"
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Select
						name="exposeType"
						onChange={onChange}
						style={{ width: '100%' }}
						value={exposedWay}
					>
						<Option value="Ingress">Ingress</Option>
						<Option value="NodePort">NodePort</Option>
					</Select>
				</FormItem>
				{exposedWay === 'Ingress' && (
					<FormItem
						label="选择ingress"
						required
						labelTextAlign="left"
						requiredMessage="请选择Ingress！"
						asterisk={false}
						className="ne-required-ingress"
					>
						<Select
							name="ingressClassName"
							style={{ width: '100%' }}
						>
							{ingresses.map((item: IngressItemProps, index) => {
								return (
									<Option
										key={index}
										value={item.ingressClassName}
									>
										{item.ingressClassName}
									</Option>
								);
							})}
						</Select>
					</FormItem>
				)}
				<FormItem
					label="对外协议"
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Select
						name="protocol"
						onChange={onProtocolChange}
						style={{ width: '100%' }}
						value={protocol}
					>
						{exposedWay === 'Ingress' && (
							<Option value="HTTP">HTTP</Option>
						)}
						{((exposedWay === 'Ingress' && ingressTcpFlag) ||
							exposedWay === 'NodePort') && (
							<Option value="TCP">TCP</Option>
						)}
					</Select>
				</FormItem>
				{protocol === 'HTTP' && (
					<FormItem
						label="访问域名"
						required
						labelTextAlign="left"
						requiredMessage="访问域名不能为空！"
						pattern={pattern.domain}
						patternMessage="请输入正确的域名格式！"
						asterisk={false}
						className="ne-required-ingress"
					>
						<Input
							name="domain"
							placeholder="例如：www.example.com"
						/>
					</FormItem>
				)}
				{protocol === 'TCP' && (
					<FormItem
						label="对外端口"
						required={exposedWay === 'Ingress' ? true : false}
						labelTextAlign="left"
						requiredMessage="对外端口不能为空！"
						format="number"
						formatMessage="请填写数字！"
						min={30000}
						max={exposedWay === 'Ingress' ? 65535 : 32000}
						minmaxMessage={`对外端口不能小于30000，大于${
							exposedWay === 'Ingress' ? 65535 : 32000
						}`}
						asterisk={false}
						className={
							exposedWay === 'Ingress'
								? 'ne-required-ingress'
								: ''
						}
					>
						<Input
							name="exposePort"
							htmlType="number"
							placeholder={
								exposedWay === 'Ingress'
									? '范围：30000-65535'
									: '范围：30000-32000'
							}
						/>
					</FormItem>
				)}
				<FormItem
					label="暴露服务"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Select
						name="serviceName"
						onChange={onServiceChange}
						style={{ width: '100%' }}
						value={selectedService.serviceName}
						autoWidth={false}
					>
						{services &&
							services.map((item: any) => {
								return (
									<Option
										key={item.serviceName}
										value={item.serviceName}
									>
										{item.serviceName}
									</Option>
								);
							})}
					</Select>
				</FormItem>
				{protocol === 'HTTP' && (
					<FormItem
						label="路径"
						required
						labelTextAlign="left"
						requiredMessage="路径不能为空！"
						pattern={pattern.path}
						patternMessage="请填写正确的URL映射格式，如：/path"
						asterisk={false}
						className="ne-required-ingress"
					>
						<Input name="path" placeholder="例如：/" />
					</FormItem>
				)}
				<FormItem
					label="暴露端口"
					required
					labelTextAlign="left"
					requiredMessage="请选择暴露端口！"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Select
						name="servicePort"
						style={{ width: '100%' }}
						autoWidth={false}
					>
						{selectedService.portDetailDtoList &&
							selectedService.portDetailDtoList.map(
								(item: any) => {
									return (
										<Option
											key={item.port}
											value={item.port}
										>
											{item.port}
										</Option>
									);
								}
							)}
					</Select>
				</FormItem>
			</Form>
		</SlidePanel>
	);
}
