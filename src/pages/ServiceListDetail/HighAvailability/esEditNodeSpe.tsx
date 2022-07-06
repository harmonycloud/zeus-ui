import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Modal, InputNumber } from 'antd';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '../../ServiceCatalog/components/TableRadio/index';
import { EsNodeProps, EsSendDataProps } from '../detail';
import styles from './esEdit.module.scss';
import { ArrowUpOutlined } from '@ant-design/icons';
import { esDataList } from '@/utils/const';

const { Item: FormItem } = Form;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 14
	}
};

export default function EsEditNodeSpe(props: EsNodeProps): JSX.Element {
	const { visible, onCreate, onCancel, data: dataes } = props;
	const [nodeModify, setNodeModify] = useState({
		nodeName: '',
		flag: false
	});
	const [specId, setSpecId] = useState('1');
	const [nodeNum, setNodeNum] = useState(0);
	const [instanceSpec, setInstanceSpec] = useState('General');
	const instanceSpecList = [
		{
			label: '通用规格',
			value: 'General'
		},
		{
			label: '自定义',
			value: 'Customize'
		}
	];
	const [mode, setMode] = useState(dataes.mode);
	const [nodeObj, setNodeObj] = useState({});

	useEffect(() => {
		const { master, kibana, data, client, cold } = dataes.quota;
		master.title = '主节点';
		kibana.title = 'Kibana节点';
		data.title = '数据节点';
		client.title = '协调节点';
		cold.title = '冷数据节点';
		master.cpu = Number(master.cpu);
		kibana.cpu = Number(kibana.cpu);
		data.cpu = Number(data.cpu);
		client.cpu = Number(client.cpu);
		cold.cpu = Number(cold.cpu);
		master.memory =
			typeof master.memory === 'string'
				? Number(master.memory.substring(0, master.memory.length - 2))
				: master.memory;
		kibana.memory =
			typeof kibana.memory === 'string'
				? Number(kibana.memory.substring(0, kibana.memory.length - 2))
				: kibana.memory;
		data.memory =
			typeof data.memory === 'string'
				? Number(data.memory.substring(0, data.memory.length - 2))
				: data.memory;
		client.memory =
			typeof client.memory === 'string'
				? Number(client.memory.substring(0, client.memory.length - 2))
				: client.memory;
		cold.memory =
			typeof cold.memory === 'string'
				? Number(cold.memory.substring(0, cold.memory.length - 2))
				: cold.memory;
		if (dataes.mode === 'simple') {
			master.disabled = false;
			kibana.disabled = false;
			client.disabled = true;
			data.disabled = true;
			cold.disabled = true;
		} else if (dataes.mode === 'regular') {
			master.disabled = false;
			kibana.disabled = false;
			data.disabled = false;
			client.disabled = true;
			cold.disabled = true;
			setMode('complex');
		} else if (data.mode === 'complex') {
			if (cold.num !== 0 && client.num === 0) {
				setMode('complex-cold');
				cold.disabled = false;
				client.disabled = true;
			}
			if (client.num !== 0 && cold.num === 0) {
				setMode('complex');
				client.disabled = false;
				cold.disabled = true;
			}
			if (cold.num !== 0 && client.num !== 0) {
				setMode('cold-complex');
				cold.disabled = false;
				client.disabled = false;
			}
			master.disabled = false;
			kibana.disabled = false;
			data.disabled = false;
		}
		setNodeObj({ master, kibana, data, client, cold });
	}, []);

	const modeList = [
		{
			label: 'N主',
			value: 'simple'
		},
		{
			label: 'N主 N数据',
			value: 'regular'
		},
		{
			label: 'N主 N数据 N协调',
			value: 'complex'
		},
		{
			label: 'N主 N数据 N冷',
			value: 'complex-cold'
		},
		{
			label: 'N主 N数据 N冷 N协调',
			value: 'cold-complex'
		}
	];

	const [form] = Form.useForm();

	const modifyQuota = (key: string) => {
		setNodeModify({
			nodeName: key,
			flag: true
		});
		setNodeNum(nodeObj[key].num);
		setSpecId(nodeObj[key].specId);
		if (nodeObj[key].specId) {
			setInstanceSpec('General');
		} else {
			setInstanceSpec('Customize');
			form.setFieldsValue({
				cpu: nodeObj[key].cpu,
				memory: nodeObj[key].memory
			});
		}
		form.setFieldsValue({
			storageClassName: nodeObj[key].storageClassName,
			storageClassQuota: nodeObj[key].storageClassQuota
		});
	};

	const putAway = (key: string) => {
		if (instanceSpec === 'Customize') {
			setSpecId('');
			const temp = nodeObj[key];
			temp.cpu = form.getFieldsValue().cpu;
			temp.memory = form.getFieldsValue().memory;
			temp.specId = '';
			setNodeObj({
				...nodeObj,
				[key]: temp
			});
		}
		setNodeModify({
			nodeName: '',
			flag: false
		});
	};

	const checkGeneral = (value: string) => {
		setSpecId(value);
		const temp = nodeObj[nodeModify.nodeName];
		switch (value) {
			case '1':
				temp.cpu = 2;
				temp.memory = 4;
				break;
			case '2':
				temp.cpu = 2;
				temp.memory = 8;
				break;
			case '3':
				temp.cpu = 4;
				temp.memory = 8;
				break;
			case '4':
				temp.cpu = 4;
				temp.memory = 16;
				break;
			case '5':
				temp.cpu = 8;
				temp.memory = 32;
				break;
			default:
				break;
		}
		setNodeObj({
			...nodeObj,
			[nodeModify.nodeName]: temp
		});
	};

	const onOk = () => {
		if (nodeModify.flag) {
			putAway(nodeModify.nodeName);
		}
		form.validateFields().then(() => {
			const sendData: EsSendDataProps = {};
			if (nodeObj) {
				sendData.quota = {};
				for (const key in nodeObj) {
					if (!nodeObj[key].disabled) {
						sendData.quota[key] = {
							...nodeObj[key],
							limitCpu: nodeObj[key].cpu,
							limitMemory: nodeObj[key].memory + 'Gi'
						};
					}
				}
			}
			onCreate(sendData);
		});
	};

	return (
		<Modal
			title="修改服务规格"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			width={1100}
		>
			<Form {...formItemLayout} form={form}>
				<div className={styles['spec-config']}>
					<ul className="form-layout">
						<li className="display-flex form-li">
							<label className="form-name">
								<span>模式</span>
							</label>
							<div
								className={`form-content display-flex ${styles['es-mode']}`}
							>
								<SelectBlock
									disabled
									options={modeList}
									currentValue={mode}
								/>
								<div
									className={`display-flex ${styles['mode-content']}`}
								>
									{Object.keys(nodeObj).map((key) => {
										if (nodeObj[key].disabled)
											return (
												<div
													className={`${styles['node-box']} ${styles['disabled']}`}
													key={key}
												>
													<div
														className={
															styles['node-type']
														}
													>
														{nodeObj[key].title}
													</div>
													<div
														className={
															styles['node-data']
														}
													>
														<span
															className={
																styles[
																	'not-start'
																]
															}
														>
															未启用
														</span>
													</div>
												</div>
											);
										else
											return (
												<div
													className={
														styles['node-box']
													}
													key={key}
												>
													<div
														className={
															styles['node-type']
														}
													>
														{nodeObj[key].title}{' '}
														<span
															className={
																styles['circle']
															}
														>
															{nodeObj[key].num}
														</span>
													</div>
													<div
														className={
															styles['node-data']
														}
													>
														<ul>
															<li>
																<span>
																	CPU：
																</span>
																<span>
																	{
																		nodeObj[
																			key
																		].cpu
																	}{' '}
																	Core
																</span>
															</li>
															<li>
																<span>
																	内存：
																</span>
																<span>
																	{
																		nodeObj[
																			key
																		].memory
																	}{' '}
																	GB
																</span>
															</li>
															{nodeObj[key]
																.storageClassName &&
																nodeObj[key]
																	.storageClassName !==
																	'' && (
																	<li>
																		<span>
																			{`${
																				nodeObj[
																					key
																				]
																					.storageClassAliasName ||
																				nodeObj[
																					key
																				]
																					.storageClassName
																			}：`}
																		</span>
																		<span>
																			{
																				nodeObj[
																					key
																				]
																					.storageClassQuota
																			}{' '}
																			{nodeObj[
																				key
																			].storageClassQuota.includes(
																				'Gi'
																			)
																				? ''
																				: 'GB'}
																		</span>
																	</li>
																)}
														</ul>
														<div
															className={
																styles['btn']
															}
														>
															{key ===
															nodeModify.nodeName ? (
																<Button
																	type="primary"
																	onClick={() =>
																		putAway(
																			key
																		)
																	}
																>
																	收起
																	<ArrowUpOutlined />
																</Button>
															) : (
																<Button
																	type="primary"
																	disabled={
																		nodeModify.nodeName !==
																			'' &&
																		key !==
																			nodeModify.nodeName
																	}
																	onClick={() =>
																		modifyQuota(
																			key
																		)
																	}
																>
																	修改
																</Button>
															)}
														</div>
													</div>
												</div>
											);
									})}
								</div>
							</div>
						</li>
						{nodeModify.flag && (
							<>
								<li className="display-flex form-li">
									<label className="form-name">
										<span>节点数量</span>
									</label>
									<div
										className={`form-content display-flex ${styles['input-flex-length']}`}
									>
										<InputNumber
											type="inline"
											disabled
											value={nodeNum}
										/>
									</div>
								</li>
								<li className="display-flex form-li">
									<label className="form-name">
										<span>节点规格</span>
									</label>
									<div
										className={`form-content display-flex ${styles['instance-spec-content']}`}
									>
										<SelectBlock
											options={instanceSpecList}
											currentValue={instanceSpec}
											onCallBack={(value) =>
												setInstanceSpec(value)
											}
										/>
										{instanceSpec === 'General' ? (
											<div
												style={{
													width: 652,
													marginTop: 16
												}}
											>
												<TableRadio
													id={specId}
													dataList={esDataList}
													onCallBack={(value) =>
														checkGeneral(
															value as string
														)
													}
												/>
											</div>
										) : null}
										{instanceSpec === 'Customize' ? (
											<div
												className={
													styles['spec-custom']
												}
											>
												<ul className="form-layout">
													<li className="display-flex">
														<label className="form-name">
															<span className="ne-required">
																CPU
															</span>
														</label>
														<div className="form-content">
															<FormItem
																required
																name="cpu"
																rules={[
																	{
																		required:
																			true,
																		message:
																			'请输入自定义CPU配额，单位为Core'
																	}
																]}
																initialValue={
																	dataes
																		.quota[
																		nodeModify
																			.nodeName
																	].cpu
																}
															>
																<InputNumber
																	style={{
																		width: '100%'
																	}}
																	step={0.1}
																	placeholder="请输入自定义CPU配额，单位为Core"
																/>
															</FormItem>
														</div>
													</li>
													<li className="display-flex">
														<label className="form-name">
															<span className="ne-required">
																内存
															</span>
														</label>
														<div className="form-content">
															<FormItem
																name="memory"
																required
																rules={[
																	{
																		required:
																			true,
																		message:
																			'请输入自定义内存配额，单位为GB'
																	}
																]}
																initialValue={
																	dataes
																		.quota[
																		nodeModify
																			.nodeName
																	].memory
																}
															>
																<InputNumber
																	style={{
																		width: '100%'
																	}}
																	step={0.1}
																	placeholder="请输入自定义内存配额，单位为GB"
																/>
															</FormItem>
														</div>
													</li>
												</ul>
											</div>
										) : null}
									</div>
								</li>
								{nodeModify.nodeName !== 'kibana' && (
									<li className="display-flex mt-8">
										<label className="form-name">
											<span>存储配额</span>
										</label>
										<div
											className={`form-content display-flex`}
										>
											<Select
												style={{
													marginRight: 8,
													width: '120px'
												}}
												disabled
												value={
													dataes.quota[
														nodeModify.nodeName
													].storageClassName
												}
											>
												<Option
													value={
														dataes.quota[
															nodeModify.nodeName
														].storageClassName
													}
												>
													{
														dataes.quota[
															nodeModify.nodeName
														].storageClassName
													}
												</Option>
											</Select>
											{/* <FormItem
												pattern={pattern.posInt}
												patternMessage="请输入正整数"
												required
												requiredMessage="请输入存储配额大小（GB）"
											>
												<Input
													name="storageClassQuota"
													value={
														Number(
															dataes.quota[
																nodeModify
																	.nodeName
															].storageClassQuota?.substring(
																0,
																dataes.quota[
																	nodeModify
																		.nodeName
																]
																	.storageClassQuota
																	.length - 2
															)
														) || 0
													}
													htmlType="number"
													min={1}
													placeholder="请输入存储配额大小"
													addonTextAfter="GB"
													disabled
												/>
											</FormItem> */}
										</div>
									</li>
								)}
							</>
						)}
					</ul>
				</div>
			</Form>
		</Modal>
	);
}
