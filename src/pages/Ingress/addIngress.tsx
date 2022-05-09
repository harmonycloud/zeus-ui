import React, { useState, useEffect } from 'react';
import SlidePanel from '@alicloud/console-components-slide-panel';
import {
	Form,
	Select,
	Input,
	Field,
	Message
} from '@alicloud/console-components';

import { connect } from 'react-redux';
import { getInstances, getServices } from '@/services/ingress';
import messageConfig from '@/components/messageConfig';

import pattern from '@/utils/pattern';
import { StoreState } from '@/types';
import {
	addIngressProps,
	selectedInstanceProps,
	instanceProps,
	servicesProps
} from './ingress';

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
function AddIngress(props: addIngressProps) {
	const {
		active,
		onCreate,
		onCancel,
		entry,
		middlewareName = '',
		globalVar: { cluster, namespace }
	} = props;
	const [isProcessing, setIsProcessing] = useState<boolean>(false); // 确认按钮 loading
	const [exposedWay, setExposedWay] = useState<string>('Ingress');
	const [protocol, setProtocol] = useState<string>(
		exposedWay === 'Ingress' ? 'HTTP' : 'TCP'
	);
	const [instances, setInstances] = useState<instanceProps[]>([]);
	const [selectedInstance, setSelectedInstance] =
		useState<selectedInstanceProps>({ name: '' });
	const [services, setServices] = useState<servicesProps[]>([]);
	const [selectedService, setSelectedService] = useState<servicesProps>({
		serviceName: '',
		portDetailDtoList: []
	});
	const [ingressTcpFlag] = useState<boolean>(
		(cluster.ingress &&
			cluster.ingress.tcp &&
			cluster.ingress.tcp.enabled) ||
			false
	);
	const field = Field.useField();

	useEffect(() => {
		const sendData = {
			clusterId: cluster.id,
			namespace: namespace.name
		};
		getInstances(sendData).then((res) => {
			if (res.success) {
				setInstances(res.data);
				if (res.data.length !== 0) {
					if (middlewareName !== '') {
						const list = res.data.filter(
							(item: any) => item.name === middlewareName
						);
						setSelectedInstance(list[0]);
						getExposedService(list[0].name, list[0].type);
					} else {
						setSelectedInstance(res.data[0]);
						getExposedService(res.data[0].name, res.data[0].type);
					}
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);

	const getExposedService = (midName: string, type: string) => {
		const sendData = {
			clusterId: cluster.id,
			namespace: namespace.name,
			middlewareName: midName,
			middlewareType: type
		};
		getServices(sendData).then((res) => {
			if (res.success) {
				setServices(res.data);
				setSelectedService(res.data[0]);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const onChange = (value: string) => {
		setExposedWay(value);
		value === 'NodePort' ? setProtocol('TCP') : setProtocol('HTTP');
	};

	const onProtocolChange = (value: string) => {
		setProtocol(value);
	};

	const onInstanceChange = (value: string) => {
		const list = instances.filter((item) => item.name === value);
		setSelectedInstance(list[0]);
		getExposedService(value, list[0].type);
	};

	const onServiceChange = (value: string) => {
		const list = services.filter((item) => item.serviceName === value);
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
			title="添加对外路由"
			okText="提交"
			isShowing={active}
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
					label="映射服务"
					required
					labelTextAlign="left"
					requiredMessage="请选择服务名称！"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Select
						name="middlewareName"
						placeholder="请选择要提供对外访问的服务"
						onChange={onInstanceChange}
						style={{ width: '100%' }}
						value={selectedInstance.name}
						disabled={entry === 'detail' ? true : false}
						autoWidth={false}
					>
						{instances &&
							instances.map((item) => {
								return (
									<Option key={item.name} value={item.name}>
										{item.name}
									</Option>
								);
							})}
					</Select>
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
						required
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
						className="ne-required-ingress"
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
							services.map((item) => {
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
							selectedService.portDetailDtoList.map((item) => {
								return (
									<Option key={item.port} value={item.port}>
										{item.port}
									</Option>
								);
							})}
					</Select>
				</FormItem>
			</Form>
		</SlidePanel>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, null)(AddIngress);
