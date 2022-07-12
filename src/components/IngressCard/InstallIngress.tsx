import React, { useEffect, useState } from 'react';
import {
	Modal,
	notification,
	Form,
	Input,
	InputNumber,
	Switch,
	AutoComplete,
	Button,
	Checkbox,
	Space
} from 'antd';
import { installIngress } from '@/services/common';
import pattern from '@/utils/pattern';
import {
	AffinityProps,
	TolerationsProps
} from '@/pages/ServiceCatalog/catalog';
import { AutoCompleteOptionItem } from '@/types/comment';
import { PlusOutlined } from '@ant-design/icons';
import { getNodePort } from '@/services/middleware';

interface InstallIngressProps {
	visible: boolean;
	clusterId: string;
	onCancel: () => void;
	onRefresh: () => void;
}
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};
const FormItem = Form.Item;
const InstallIngressForm = (props: InstallIngressProps) => {
	const { visible, onCancel, onRefresh, clusterId } = props;
	const [form] = Form.useForm();
	const [portConfig, setPortConfig] = useState<boolean>(false);
	const [vipChecked, setVIPChecked] = useState<boolean>(false);
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [tolerations, setTolerations] = useState<TolerationsProps>({
		flag: false,
		label: ''
	});
	const [label, setLabel] = useState<string>('');
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [checked, setChecked] = useState<boolean>(false);

	useEffect(() => {
		getNodePort({ clusterId }).then((res) => {
			if (res.success) {
				const list = res.data.map((item: string) => {
					return {
						value: item,
						label: item
					};
				});
				setLabelList(list);
			}
		});
	}, []);
	useEffect(() => {
		form.setFieldsValue({
			ingressClassName: 'nginx-ingress-controller',
			httpPort: 80,
			httpsPort: 443,
			healthzPort: 10254,
			defaultServerPort: 8181
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			onCancel();
			installIngress({ ...values, clusterId }).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '负载均衡安装成功'
					});
					onRefresh();
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};
	return (
		<Modal
			title="安装负载均衡"
			width={640}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
		>
			<Form {...formItemLayout} labelAlign="left" form={form}>
				<FormItem
					label="ingress名称"
					required
					rules={[
						{ required: true, message: '请输入Ingress名称' },
						{
							pattern: new RegExp(pattern.ingressName),
							message: '请输入由小写字母数字及“-”组成的1-40个字符'
						}
					]}
					name="ingressClassName"
				>
					<Input placeholder="请输入Ingress名称" />
				</FormItem>
				<FormItem label="VIP配置" required name="vip">
					<div className="display-flex flex-align">
						<Switch
							checked={vipChecked}
							onChange={(check: boolean) => {
								setVIPChecked(check);
							}}
						/>
						{vipChecked && (
							<Input
								style={{ width: '100%', marginLeft: 8 }}
								placeholder="请输入VIP地址"
							/>
						)}
					</div>
				</FormItem>
				<FormItem label="节点亲和" name="nodeAffinity">
					<div className="display-flex flex-align">
						<Switch
							style={{ marginRight: 8 }}
							checked={affinity.flag}
							onChange={(check: boolean) =>
								setAffinity({ ...affinity, flag: check })
							}
						/>
						{affinity.flag && (
							<Space>
								<AutoComplete
									allowClear
									placeholder="请输入key=value格式的内容"
									value={label}
									style={{ width: 260 }}
									options={labelList}
									onChange={(value) => setLabel(value)}
									status={
										label &&
										!/^[a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+$/.test(
											label
										)
											? 'error'
											: ''
									}
								/>
								<Button
									style={{
										marginLeft: '4px',
										padding: '0 9px'
									}}
									disabled={
										!label ||
										!/^[a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+$/.test(
											label
										)
											? true
											: false
									}
									onClick={() => {
										// if (
										// 	!values.find(
										// 		(item: any) => item.label === label
										// 	)
										// ) {
										// 	onChange([
										// 		...values,
										// 		{
										// 			label: label,
										// 			checked,
										// 			id: Math.random()
										// 		}
										// 	]);
										// }
									}}
								>
									<PlusOutlined
										style={{
											color: '#005AA5'
										}}
									/>
								</Button>
								<Checkbox
									checked={checked}
									onChange={(e) => {
										setChecked(e.target.checked);
										// onChange(
										// 	values.map((item: any) => {
										// 		return {
										// 			label: item.label,
										// 			id: item.id,
										// 			checked: e.target.checked
										// 		};
										// 	})
										// );
									}}
								>
									强制亲和
								</Checkbox>
							</Space>
						)}
					</div>
				</FormItem>
				<FormItem label="污点容忍" name="tolerations">
					<div className="display-flex flex-align">
						<Switch
							style={{ marginRight: 8 }}
							checked={tolerations.flag}
							onChange={(check: boolean) =>
								setTolerations({ ...tolerations, flag: check })
							}
						/>
						{tolerations.flag && (
							<Space>
								<AutoComplete
									allowClear
									placeholder="请输入key=value格式的内容"
									value={label}
									style={{ width: 260 }}
									options={labelList}
									onChange={(value) => setLabel(value)}
									status={
										label &&
										!/^[a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+$/.test(
											label
										)
											? 'error'
											: ''
									}
								/>
								<Button
									style={{
										marginLeft: '4px',
										padding: '0 9px'
									}}
									disabled={
										!label ||
										!/^[a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+$/.test(
											label
										)
											? true
											: false
									}
									onClick={() => {
										// if (
										// 	!values.find(
										// 		(item: any) => item.label === label
										// 	)
										// ) {
										// 	onChange([
										// 		...values,
										// 		{
										// 			label: label,
										// 			checked,
										// 			id: Math.random()
										// 		}
										// 	]);
										// }
									}}
								>
									<PlusOutlined
										style={{
											color: '#005AA5'
										}}
									/>
								</Button>
							</Space>
						)}
					</div>
				</FormItem>
				<FormItem label="端口配置" name="port">
					<Switch
						checked={portConfig}
						onChange={(check: boolean) => setPortConfig(check)}
					/>
				</FormItem>
				{portConfig && (
					<>
						<FormItem label="http端口" name="httpPort">
							<InputNumber
								step={1}
								min={1}
								max={65535}
								style={{ width: '100%' }}
								placeholder="请输入http端口"
							/>
						</FormItem>
						<FormItem label="https端口" name="httpsPort">
							<InputNumber
								step={1}
								min={1}
								max={65535}
								style={{ width: '100%' }}
								placeholder="请输入https端口"
							/>
						</FormItem>
						<FormItem label="healthz端口" name="healthzPort">
							<InputNumber
								step={1}
								min={1}
								max={65535}
								style={{ width: '100%' }}
								placeholder="请输入healthz端口"
							/>
						</FormItem>
						<FormItem label="默认服务端口" name="defaultServerPort">
							<InputNumber
								step={1}
								min={1}
								max={65535}
								style={{ width: '100%' }}
								placeholder="请输入默认服务端口"
							/>
						</FormItem>
					</>
				)}
			</Form>
		</Modal>
	);
};
export default InstallIngressForm;
