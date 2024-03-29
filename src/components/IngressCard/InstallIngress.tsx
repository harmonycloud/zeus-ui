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
	Space,
	Tag
} from 'antd';
import { installIngress } from '@/services/common';
import pattern from '@/utils/pattern';
import {
	AffinityLabelsItem,
	AffinityProps,
	TolerationsProps
} from '@/pages/ServiceCatalog/catalog';
import { AutoCompleteOptionItem } from '@/types/comment';
import { PlusOutlined } from '@ant-design/icons';
import { getNodePort, getNodeTaint } from '@/services/middleware';
import { TolerationLabelItem } from '../FormTolerations/formTolerations';
import { getVIPs } from '@/services/ingress';
import { judgeObjArrayHeavyByAttr } from '@/utils/utils';
import './index.scss';

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
	const [tolerationsLabels, setTolerationsLabels] = useState<
		TolerationLabelItem[]
	>([]);
	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	const [label, setLabel] = useState<string>('');
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [taintLabel, setTaintLabel] = useState<string>('');
	const [taintList, setTaintList] = useState<AutoCompleteOptionItem[]>([]);
	const [checked, setChecked] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [vips, setVIPs] = useState<string[]>([]);
	const [vipNoAlive, setVIPNoAlive] = useState<boolean>(false);

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
		getNodeTaint({ clusterid: clusterId }).then((res) => {
			if (res.success) {
				const list = res.data.map((item: string) => {
					return {
						value: item,
						label: item
					};
				});
				setTaintList(list);
			}
		});
		getVIPs({ clusterId }).then((res) => {
			if (res.success) {
				setVIPs(res.data);
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
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAddress(event.target.value);
		if (event.target.value === '') {
			setVIPNoAlive(true);
		} else {
			setVIPNoAlive(false);
		}
	};
	const onOk = () => {
		form.validateFields().then((values) => {
			if (vipChecked && address === '') {
				setVIPNoAlive(true);
				return;
			}
			const sendData = {
				clusterId,
				type: 'nginx',
				...values
			};
			const ports = [
				values.httpPort,
				values.httpsPort,
				values.healthzPort,
				values.defaultServerPort
			];
			if (
				portConfig &&
				Array.from(new Set(ports)).length !== ports.length
			) {
				notification.error({
					message: '错误',
					description: '端口配置有重复项'
				});
				return;
			}
			if (affinity.flag) {
				if (!affinityLabels.length) {
					notification.error({
						message: '错误',
						description: '请选择主机亲和。'
					});
					return;
				} else {
					sendData.nodeAffinity = affinityLabels.map((item) => {
						return {
							label: item.label,
							anti: item.anti,
							required: item.checked
						};
					});
				}
			}
			if (tolerations.flag) {
				if (!tolerationsLabels.length) {
					notification.error({
						message: '错误',
						description: '请选择主机容忍。'
					});
					return;
				} else {
					sendData.tolerations = tolerationsLabels.map(
						(item) => item.label
					);
				}
			}
			if (!portConfig) {
				sendData.httpPort = null;
				sendData.httpsPort = null;
				sendData.healthzPort = null;
				sendData.defaultServerPort = null;
			}
			if (!vipChecked) {
				sendData.address = null;
			} else {
				sendData.address = address;
			}
			onCancel();
			console.log(sendData);
			installIngress(sendData).then((res) => {
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
			title="安装Nginx"
			width={640}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
		>
			<Form {...formItemLayout} labelAlign="left" form={form}>
				<FormItem
					label="Nginx名称"
					required
					rules={[
						{ required: true, message: '请输入Nginx名称' },
						{
							pattern: new RegExp(pattern.ingressName),
							message: '请输入由小写字母数字及“-”组成的1-40个字符'
						}
					]}
					name="ingressClassName"
				>
					<Input placeholder="请输入Nginx名称" />
				</FormItem>
				<FormItem label="VIP配置" required name="address">
					<div className="display-flex flex-align">
						<Switch
							checked={vipChecked}
							onChange={(check: boolean) => {
								setVIPChecked(check);
							}}
						/>
						{vipChecked && (
							<Input
								value={address}
								style={{ width: '100%', marginLeft: 8 }}
								placeholder="请输入VIP地址"
								onChange={handleChange}
								status={
									vipNoAlive
										? 'error'
										: vips.find((item) => item === address)
										? 'error'
										: ''
								}
							/>
						)}
					</div>
					{vipChecked && vips.find((item) => item === address) && (
						<div
							style={{
								marginLeft: 52,
								color: '#ff4d4f'
							}}
						>
							当前VIP地址已经被配置
						</div>
					)}
					{vipChecked && vipNoAlive && (
						<div
							style={{
								marginLeft: 52,
								color: '#ff4d4f'
							}}
						>
							请输入VIP地址
						</div>
					)}
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
										if (
											!affinityLabels.find(
												(item: any) =>
													item.label === label
											)
										) {
											setAffinityLabels([
												...affinityLabels,
												{
													label: label,
													checked,
													anti: false,
													id: Math.random()
												}
											]);
										}
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
										setAffinityLabels(
											affinityLabels.map((item: any) => {
												return {
													label: item.label,
													id: item.id,
													anti: false,
													checked: e.target.checked
												};
											})
										);
									}}
								>
									强制亲和
								</Checkbox>
							</Space>
						)}
					</div>
					{label &&
					!/^[a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+$/.test(label) ? (
						<div
							style={{
								marginLeft: 52,
								color: '#ff4d4f'
							}}
						>
							请输入key=value格式的内容
						</div>
					) : null}
					{affinity.flag && affinityLabels.length > 0 && (
						<div className="tag-box">
							<Space wrap>
								{affinityLabels.map((item) => {
									return (
										<Tag
											key={item.label}
											closable
											style={{
												padding: '4px 10px'
											}}
											onClose={() =>
												setAffinityLabels(
													affinityLabels.filter(
														(arr) =>
															arr.id !== item.id
													)
												)
											}
										>
											{item.label}
										</Tag>
									);
								})}
							</Space>
						</div>
					)}
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
							<>
								<Space>
									<AutoComplete
										allowClear
										value={taintLabel}
										style={{ width: 372 }}
										options={taintList}
										onChange={(value) =>
											setTaintLabel(value)
										}
									/>
									<Button
										style={{
											marginLeft: '4px',
											padding: '0 9px'
										}}
										onClick={() => {
											if (
												!tolerationsLabels.find(
													(item: any) =>
														item.label ===
														taintLabel
												)
											) {
												setTolerationsLabels([
													...tolerationsLabels,
													{
														label: taintLabel,
														id: Math.random()
													}
												]);
											}
										}}
									>
										<PlusOutlined
											style={{
												color: '#005AA5'
											}}
										/>
									</Button>
								</Space>
							</>
						)}
					</div>
					{tolerations.flag && tolerationsLabels.length > 0 && (
						<div className="tag-box">
							<Space wrap>
								{tolerationsLabels.map((item) => {
									return (
										<Tag
											key={item.label}
											closable
											style={{
												padding: '4px 10px'
											}}
											onClose={() =>
												setTolerationsLabels(
													tolerationsLabels.filter(
														(arr) =>
															arr.id !== item.id
													)
												)
											}
										>
											{item.label}
										</Tag>
									);
								})}
							</Space>
						</div>
					)}
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
