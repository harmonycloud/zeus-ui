import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select,
	Message
} from '@alicloud/console-components';
import SelectBlock from '@/pages/ServiceCatalog/components/SelectBlock';
import TableRadio from '@/pages/ServiceCatalog/components/TableRadio';
import pattern from '@/utils/pattern';
import { getStorageClass } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { instanceSpecList } from '@/utils/const';
import { modeItemProps } from './index';

interface EditQuotaFormProps extends modeItemProps {
	visible: boolean;
	onCreate: (value: any) => void;
	onCancel: () => void;
}
interface storageClassListItem {
	name: string;
	[propName: string]: any;
}

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};
const FormItem = Form.Item;
const EditQuotaForm = (props: EditQuotaFormProps) => {
	const { visible, onCancel, onCreate, data, clusterId, namespace, type } =
		props;
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [storageClassList, setStorageClassList] = useState<
		storageClassListItem[]
	>([]);
	const [modifyData, setModifyData] = useState<modeItemProps['data']>(data);
	const field = Field.useField();
	useEffect(() => {
		getStorageClass({
			clusterId: clusterId,
			namespace: namespace
		}).then((res) => {
			if (res.success) {
				setStorageClassList(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
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
		<Dialog
			title="实例配置"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
		>
			<Form {...formItemLayout} field={field}>
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
													min={0.1}
													minmaxMessage="最小为0.1"
													required
													requiredMessage="请输入自定义CPU配额，单位为Core"
												>
													<Input
														name="cpu"
														htmlType="number"
														min={0.1}
														step={0.1}
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
													min={0.1}
													minmaxMessage="最小为0.1"
													required
													requiredMessage="请输入自定义内存配额，单位为Gi"
												>
													<Input
														name="memory"
														htmlType="number"
														min={0.1}
														step={0.1}
														placeholder="请输入自定义内存配额，单位为Gi"
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
					{type !== 'kibana' && type !== 'sentinel' && (
						<li className="display-flex mt-8">
							<label className="form-name">
								<span className="ne-required">存储配额</span>
							</label>
							<div className={`form-content display-flex`}>
								<FormItem
									required
									requiredMessage="请选择存储类型"
								>
									<Select
										name="storageClass"
										style={{
											marginRight: 8
										}}
										autoWidth={false}
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
									pattern={pattern.posInt}
									patternMessage="请输入小于21位的正整数"
									required
									requiredMessage="请输入存储配额大小（GB）"
								>
									<Input
										name="storageQuota"
										defaultValue={5}
										htmlType="number"
										min={1}
										placeholder="请输入存储配额大小"
										addonTextAfter="GB"
									/>
								</FormItem>
							</div>
						</li>
					)}
				</ul>
			</Form>
		</Dialog>
	);
};
export default EditQuotaForm;
