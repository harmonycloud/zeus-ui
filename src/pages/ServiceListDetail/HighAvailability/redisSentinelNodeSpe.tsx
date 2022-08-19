import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, InputNumber, Select } from 'antd';
import { EsSendDataProps, RedisSentinelNodeSpeProps } from '../detail';
import styles from './esEdit.module.scss';
import SelectBlock from '@/components/SelectBlock';
import { formItemLayout614, redisSentinelDataList } from '@/utils/const';
import { ArrowUpOutlined } from '@ant-design/icons';
import TableRadio from '../../ServiceCatalog/components/TableRadio/index';
const modeList = [
	{
		label: '哨兵模式',
		value: 'sentinel'
	}
];
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
const Option = Select.Option;
const FormItem = Form.Item;

export default function RedisSentinelNodeSpe(props: RedisSentinelNodeSpeProps) {
	const { visible, onCreate, onCancel, data } = props;
	console.log(data);
	const [mode, setMode] = useState(data.mode);
	const [nodeObj, setNodeObj] = useState({});
	const [nodeModify, setNodeModify] = useState({
		nodeName: '',
		flag: false
	});
	const [specId, setSpecId] = useState('1');
	const [nodeNum, setNodeNum] = useState(0);
	const [instanceSpec, setInstanceSpec] = useState('General');
	const [form] = Form.useForm();

	useEffect(() => {
		const { redis, sentinel } = data.quota;
		redis.title = 'Redis节点';
		sentinel.title = '哨兵节点';
		redis.cpu = Number(redis.cpu);
		sentinel.cpu = Number(sentinel.cpu);
		redis.memory =
			typeof redis.memory === 'string'
				? Number(redis.memory.substring(0, redis.memory.length - 2))
				: redis.memory;
		sentinel.memory =
			typeof sentinel.memory === 'string'
				? Number(
						sentinel.memory.substring(0, sentinel.memory.length - 2)
				  )
				: sentinel.memory;
		setNodeObj({ redis, sentinel });
	}, []);
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
	const checkGeneral = (value: string) => {
		setSpecId(value);
		const temp = nodeObj[nodeModify.nodeName];
		switch (value) {
			case '1':
				temp.cpu = 2;
				temp.memory = 0.256;
				break;
			case '2':
				temp.cpu = 2;
				temp.memory = 1;
				break;
			case '3':
				temp.cpu = 2;
				temp.memory = 2;
				break;
			case '4':
				temp.cpu = 2;
				temp.memory = 8;
				break;
			case '5':
				temp.cpu = 2;
				temp.memory = 16;
				break;
			case '6':
				temp.cpu = 2;
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
				sendData.quota = nodeObj;
			}
			// console.log(sendData);
			onCreate(sendData);
		});
	};
	return (
		<Modal
			title="修改服务规格"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			width={900}
		>
			<Form form={form}>
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
																			{nodeObj[
																				key
																			]
																				.storageClassAliasName ||
																				nodeObj[
																					key
																				]
																					.storageClassName}
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
													dataList={
														redisSentinelDataList
													}
													onCallBack={(value: any) =>
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
																	data.quota[
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
																	data.quota[
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
								{nodeModify.nodeName !== 'sentinel' && (
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
													data.quota[
														nodeModify.nodeName
													].storageClassAliasName
												}
												dropdownMatchSelectWidth={false}
											>
												<Option
													value={
														data.quota[
															nodeModify.nodeName
														].storageClassAliasName
													}
												>
													{
														data.quota[
															nodeModify.nodeName
														].storageClassAliasName
													}
												</Option>
											</Select>
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
