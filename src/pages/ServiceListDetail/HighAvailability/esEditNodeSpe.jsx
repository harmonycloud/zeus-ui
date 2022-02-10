import React, { useState, useEffect } from 'react';
import {
	Form,
	Field,
	Input,
	Icon,
	Select,
	Button,
	Dialog,
	NumberPicker,
	Message
} from '@alicloud/console-components';
import SelectBlock from '../../ServiceCatalog/components/SelectBlock/index';
import TableRadio from '../../ServiceCatalog/components/TableRadio/index';
import styles from './esEdit.module.scss';
import pattern from '@/utils/pattern';
import messageConfig from '@/components/messageConfig';

const { Item: FormItem } = Form;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};

export default function EsEditNodeSpe(props) {
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
		let { master, kibana, data, client, cold } = dataes.quota;
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

	const field = Field.useField();

	const formHandle = (obj, item) => {
		if (
			['cpu', 'memory', 'storageClassName', 'storageClassQuota'].indexOf(
				item.name
			) > -1
		) {
			let temp = nodeObj[nodeModify.nodeName];
			temp[item.name] = item.value;
			setNodeObj({
				...nodeObj,
				[nodeModify.nodeName]: temp
			});
		}
	};

	const modifyQuota = (key) => {
		setNodeModify({
			nodeName: key,
			flag: true
		});
		setNodeNum(nodeObj[key].num);
		setSpecId(nodeObj[key].specId);
		if (nodeObj[key].specId === '') {
			setInstanceSpec('Customize');
			field.setValues({
				cpu: nodeObj[key].cpu,
				memory: nodeObj[key].memory
			});
		} else {
			setInstanceSpec('General');
		}
		field.setValues({
			storageClassName: nodeObj[key].storageClassName,
			storageClassQuota: nodeObj[key].storageClassQuota
		});
	};

	const putAway = (key) => {
		if (instanceSpec === 'Customize') {
			setSpecId('');
			let temp = nodeObj[key];
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

	const checkGeneral = (value) => {
		setSpecId(value);
		let temp = nodeObj[nodeModify.nodeName];
		switch (value) {
			case '1':
				temp.cpu = 1;
				temp.memory = 2;
				break;
			case '2':
				temp.cpu = 2;
				temp.memory = 8;
				break;
			case '3':
				temp.cpu = 4;
				temp.memory = 16;
				break;
			case '4':
				temp.cpu = 8;
				temp.memory = 32;
				break;
			case '5':
				temp.cpu = 16;
				temp.memory = 64;
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
		field.validate((err) => {
			if (!err) {
				const sendData = {};
				if (nodeObj) {
					sendData.quota = {};
					for (let key in nodeObj) {
						if (!nodeObj[key].disabled) {
							// 因为es规格配置不能修改存储类型和配额，这段代码暂时注解
							// if (nodeObj[key].storageClass === '') {
							// 	Message.show(
							// 		messageConfig(
							// 			'error',
							// 			'失败',
							// 			`${key}节点没有选择存储配额`
							// 		)
							// 	);
							// 	modifyQuota(key);
							// 	return;
							// }
							// if (nodeObj[key].storageQuota === 0) {
							// 	Message.show(
							// 		messageConfig(
							// 			'error',
							// 			'失败',
							// 			`${key}节点存储配额不能为0`
							// 		)
							// 	);
							// 	modifyQuota(key);
							// 	return;
							// }
							sendData.quota[key] = {
								...nodeObj[key],
								storageClassName: nodeObj[key].storageClass,
								storageClassQuota: nodeObj[key].storageQuota
							};
						}
					}
				}
				onCreate(sendData);
			}
		});
	};

	return (
		<Dialog
			title="修改服务规格"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			isFullScreen={true}
			footerAlign="right"
			// footerActions={nodeModify.flag ? ['cancel'] : ['ok', 'cancel']}
		>
			<Form {...formItemLayout} field={field} onChange={formHandle}>
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
																			{
																				nodeObj[
																					key
																				]
																					.storageClassName
																			}
																			：
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
																	<Icon type="arrow-up" />
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
										<NumberPicker
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
													onCallBack={(value) =>
														checkGeneral(value)
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
																patternMessage="请输入正整数"
																required
																requiredMessage="请输入自定义CPU配额，单位为Core"
															>
																<Input
																	name="cpu"
																	htmlType="number"
																	min={0.1}
																	step={0.1}
																	value={
																		dataes
																			.quota[
																			nodeModify
																				.nodeName
																		].cpu
																	}
																	placeholder="请输入自定义CPU配额，单位为Core"
																	trim
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
																patternMessage="请输入正整数"
																required
																requiredMessage="请输入自定义内存配额，单位为GB"
															>
																<Input
																	name="memory"
																	htmlType="number"
																	min={0.1}
																	step={0.1}
																	value={
																		dataes
																			.quota[
																			nodeModify
																				.nodeName
																		].memory
																	}
																	placeholder="请输入自定义内存配额，单位为GB"
																	trim
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
											<FormItem
												required
												requiredMessage="请选择存储类型"
											>
												<Select
													name="storageClassName"
													style={{
														marginRight: 8
													}}
													disabled
													value={
														dataes.quota[
															nodeModify.nodeName
														].storageClassName
													}
													autoWidth={false}
												>
													<Option
														value={
															dataes.quota[
																nodeModify
																	.nodeName
															].storageClassName
														}
													>
														{
															dataes.quota[
																nodeModify
																	.nodeName
															].storageClassName
														}
													</Option>
												</Select>
											</FormItem>
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
		</Dialog>
	);
}
