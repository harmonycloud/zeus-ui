import React, { useEffect, useState } from 'react';
import {
	AutoComplete,
	Button,
	Checkbox,
	Form,
	Input,
	InputNumber,
	Modal,
	notification,
	Space,
	Switch,
	Tag,
	Tooltip,
	Row,
	Col
} from 'antd';
import pattern from '@/utils/pattern';
import {
	AffinityLabelsItem,
	AffinityProps,
	TolerationsProps
} from '@/pages/ServiceCatalog/catalog';
import { TolerationLabelItem } from '../FormTolerations/formTolerations';
import { AutoCompleteOptionItem } from '@/types/comment';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { installIngress } from '@/services/common';
import { getNodePort, getNodeTaint } from '@/services/middleware';
import { getVIPs, checkTraefikPort } from '@/services/ingress';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import './index.scss';

interface InstallTraefikProps {
	visible: boolean;
	onCancel: () => void;
	clusterId: string;
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
export default function InstallTraefik(
	props: InstallTraefikProps
): JSX.Element {
	const { visible, onCancel, clusterId, onRefresh } = props;
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
	const [skipPortConflict, setSkipPortConflict] = useState<boolean>(false);
	const [startPort, setStartPort] = useState<number>();
	const [ports, setPorts] = useState<number[]>();
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
	const onChange = (e: CheckboxChangeEvent) => {
		setSkipPortConflict(e.target.checked);
	};
	const onInputNumberChange = (value: number) => {
		setStartPort(value);
		if (value >= 30000 && value <= 65435) {
			setPorts(undefined);
			checkTraefikPort({ clusterId, startPort: value }).then((res) => {
				if (res.success) {
					setPorts(res.data);
				}
			});
		}
	};
	const onOk = () => {
		form.validateFields().then((values) => {
			console.log(values);
			if (vipChecked && address === '') {
				setVIPNoAlive(true);
				return;
			}
			const sendData = {
				clusterId,
				...values,
				type: 'traefik',
				skipPortConflict: skipPortConflict
			};
			if (!skipPortConflict) {
				if (ports && ports?.length > 0) {
					notification.error({
						message: '错误',
						description:
							'当前端口组存在冲突，请重新输入或勾选强制跳过端口冲突！'
					});
				}
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
				sendData.dashboardPort = null;
				sendData.monitorPort = null;
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
						description: 'Traefik安装成功'
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
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAddress(event.target.value);
		if (event.target.value === '') {
			setVIPNoAlive(true);
		} else {
			setVIPNoAlive(false);
		}
	};

	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			title="安装Traefik"
			onOk={onOk}
			width={640}
		>
			<Form {...formItemLayout} labelAlign="left" form={form}>
				<FormItem
					label="Traefik名称"
					required
					rules={[
						{ required: true, message: '请输入Traefik名称' },
						{
							pattern: new RegExp(pattern.ingressName),
							message: '请输入由小写字母数字及“-”组成的1-40个字符'
						}
					]}
					initialValue="traefik-controller"
					name="ingressClassName"
				>
					<Input placeholder="请输入Traefik名称" />
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
						<FormItem label="Dashboard端口" name="dashboardPort">
							<InputNumber
								step={1}
								min={1}
								max={65535}
								style={{ width: '100%' }}
								placeholder="请输入Dashboard端口"
							/>
						</FormItem>
						<FormItem label="数据监控端口" name="monitorPort">
							<InputNumber
								step={1}
								min={1}
								max={65535}
								style={{ width: '100%' }}
								placeholder="请输入数据监控端口"
							/>
						</FormItem>
					</>
				)}
				<FormItem
					label={
						<Space>
							<span>起始服务端口</span>
							<Tooltip title="默认选择从起始服务端口开始的100个端口为服务端口组">
								<QuestionCircleOutlined
									style={{ marginRight: 8 }}
								/>
							</Tooltip>
						</Space>
					}
					required
					rules={[
						{ required: true, message: '请输入起始服务端口' },
						{
							min: 30000,
							type: 'number',
							max: 65435,
							message: '请输入30000-65435范围内的端口号'
						}
					]}
				>
					<FormItem
						noStyle
						name="startPort"
						rules={[
							{ required: true, message: '请输入起始服务端口' },
							{
								min: 30000,
								type: 'number',
								max: 65435,
								message: '请输入30000-65435范围内的端口号'
							}
						]}
					>
						<InputNumber
							value={startPort}
							onChange={onInputNumberChange}
							style={{ width: '330px', marginRight: 8 }}
							placeholder="请输入30000-65435范围内的端口号"
						/>
					</FormItem>
					<FormItem noStyle name="skipPortConflict">
						<Checkbox
							checked={skipPortConflict}
							onChange={onChange}
						>
							强制跳过端口冲突
						</Checkbox>
					</FormItem>
				</FormItem>
				{startPort && startPort >= 30000 && startPort <= 65435 && (
					<Row>
						<Col span={5}></Col>
						<Col>
							<div>
								当前选择的服务端口组是
								{form.getFieldValue('startPort')}-
								{form.getFieldValue('startPort') + 100}
							</div>
							{ports?.length === 0 && (
								<div>其中没有端口被占用！</div>
							)}
							{ports && ports.length > 0 && (
								<div style={{ color: '#ff4d4f' }}>
									其中{ports?.join(',')}
									端口号被占用，请重新输入
								</div>
							)}
						</Col>
					</Row>
				)}
			</Form>
		</Modal>
	);
}
