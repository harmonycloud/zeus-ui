import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Form, notification, InputNumber } from 'antd';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '@/pages/ServiceCatalog/components/TableRadio';

import pattern from '@/utils/pattern';
import { getStorageClass } from '@/services/middleware';
import { instanceSpecList } from '@/utils/const';
import { modeItemProps } from './index';

interface EditQuotaFormProps extends modeItemProps {
	visible: boolean;
	onCreate: (value: any) => void;
	onCancel: () => void;
	inputChange: (value: any) => void;
}
interface storageClassListItem {
	name: string;
	[propName: string]: any;
}

const FormItem = Form.Item;
const EditQuotaForm = (props: EditQuotaFormProps) => {
	const {
		visible,
		onCancel,
		onCreate,
		data,
		clusterId,
		namespace,
		type,
		inputChange
	} = props;
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [storageClassList, setStorageClassList] = useState<
		storageClassListItem[]
	>([]);
	const [modifyData, setModifyData] = useState<modeItemProps['data']>(data);
	const [form] = Form.useForm();
	useEffect(() => {
		getStorageClass({
			clusterId: clusterId,
			namespace: namespace
		}).then((res) => {
			if (res.success) {
				setStorageClassList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			const value = { ...modifyData, ...values };
			onCreate(value);
		});
	};
	const checkGeneral = (value: any) => {
		switch (value) {
			case '1':
				setModifyData({
					...modifyData,
					cpu: 1,
					memory: 2,
					specId: value
				});
				break;
			case '2':
				setModifyData({
					...modifyData,
					cpu: 2,
					memory: 8,
					specId: value
				});
				break;
			case '3':
				setModifyData({
					...modifyData,
					cpu: 4,
					memory: 16,
					specId: value
				});
				break;
			case '4':
				setModifyData({
					...modifyData,
					cpu: 8,
					memory: 32,
					specId: value
				});
				break;
			case '5':
				setModifyData({
					...modifyData,
					cpu: 16,
					memory: 64,
					specId: value
				});
				break;
			default:
				break;
		}
	};
	return (
		<Modal
			title="实例配置"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={820}
		>
			<Form form={form}>
				<FormItem
					label="数据节点数量"
					labelAlign="left"
					rules={[
						{
							type: 'number',
							min:
								data.title === '主节点' ||
								data.title === '数据节点'
									? 3
									: 1,
							message: '数据节点数量最小值为3'
						}
					]}
					name="num"
					className="ant-form-name"
					initialValue={data.num}
				>
					<InputNumber
						// min={
						// 	data.title === '主节点' || data.title === '数据节点'
						// 		? 3
						// 		: 1
						// }
						value={data.num}
						style={{ width: '100px' }}
						onChange={inputChange}
					/>
				</FormItem>
				<ul className="form-layout">
					<li className="display-flex form-li">
						<label className="form-name">
							<span>节点规格</span>
						</label>
						<div className="form-content display-flex instance-spec-content">
							<SelectBlock
								options={instanceSpecList}
								currentValue={instanceSpec}
								onCallBack={(value: any) => {
									setInstanceSpec(value);
								}}
							/>
							{instanceSpec === 'General' ? (
								<div
									style={{
										width: 652,
										marginTop: 16
									}}
								>
									<TableRadio
										id={modifyData.specId}
										onCallBack={(value: any) =>
											checkGeneral(value)
										}
									/>
								</div>
							) : null}
							{instanceSpec === 'Customize' ? (
								<div className="spec-custom">
									<ul className="form-layout">
										<li className="display-flex">
											<label className="form-name">
												<span className="ne-required">
													CPU
												</span>
											</label>
											<div className="form-content">
												<FormItem
													rules={[
														{
															type: 'number',
															min: 0.1,
															message: '最小为0.1'
														},
														{
															required: true,
															message:
																'请输入自定义CPU配额，单位为Core'
														}
													]}
													name="cpu"
												>
													<InputNumber
														step={0.1}
														style={{
															width: '100%'
														}}
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
													rules={[
														{
															type: 'number',
															min: 0.1,
															message: '最小为0.1'
														},
														{
															required: true,
															message:
																'请输入自定义内存配额，单位为Core'
														}
													]}
													name="memory"
												>
													<InputNumber
														step={0.1}
														style={{
															width: '100%'
														}}
														placeholder="请输入自定义内存配额，单位为Gi"
													/>
												</FormItem>
											</div>
										</li>
									</ul>
								</div>
							) : null}
						</div>
					</li>
					{type !== 'kibana' && type !== 'sentinel' && (
						<li className="display-flex mt-8">
							<label className="form-name">
								<span className="ne-required">存储配额</span>
							</label>
							<div className={`form-content display-flex`}>
								<FormItem
									rules={[
										{
											required: true,
											message: '请选择存储类型'
										}
									]}
									name="storageClass"
								>
									<Select
										placeholder="请选择"
										style={{
											marginRight: 8,
											width: 150
										}}
									>
										{storageClassList.map((item, index) => {
											return (
												<Select.Option
													key={index}
													value={item.name}
												>
													{item.name}
												</Select.Option>
											);
										})}
									</Select>
								</FormItem>
								<FormItem
									rules={[
										{
											required: true,
											message: '请输入存储配额大小（GB）'
										},
										{
											pattern: new RegExp(pattern.posInt),
											message: '请输入小于21位的正整数'
										}
									]}
									name="storageQuota"
								>
									<Input
										defaultValue={5}
										min={1}
										placeholder="请输入存储配额大小"
										addonAfter="GB"
									/>
								</FormItem>
							</div>
						</li>
					)}
				</ul>
			</Form>
		</Modal>
	);
};
export default EditQuotaForm;
