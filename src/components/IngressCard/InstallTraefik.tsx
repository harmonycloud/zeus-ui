import React, { useState } from 'react';
import {
	AutoComplete,
	Button,
	Checkbox,
	Form,
	Input,
	InputNumber,
	Modal,
	Space,
	Switch,
	Tag,
	Tooltip
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

interface InstallTraefikProps {
	visible: boolean;
	onCancel: () => void;
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
	const { visible, onCancel } = props;
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
	const onOk = () => {
		console.log('click');
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
					name="TraefikName"
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
					name="startPort"
					required
					rules={[{ required: true, message: '请输入起始服务端口' }]}
				>
					<InputNumber
						style={{ width: '100%' }}
						placeholder="请输入30000-65435范围内的端口号"
					/>
				</FormItem>
			</Form>
		</Modal>
	);
}
