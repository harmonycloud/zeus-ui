import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Checkbox,
	Select,
	Message
} from '@alicloud/console-components';
import { ParamterItem } from './paramterEdit';
import { initParamsTemp, getParamsTemp } from '@/services/template';
import messageConfig from '@/components/messageConfig';

interface EditParamItemProps {
	data: any;
	visible: boolean;
	onCancel: () => void;
	onCreate: (values: ParamterItem) => void;
	uid: string;
	type: string;
	chartVersion: string;
	templateName: string;
}
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 16
	}
};
const FormItem = Form.Item;
const Option = Select.Option;
const EditParamItem = (props: EditParamItemProps) => {
	const {
		visible,
		onCancel,
		data,
		onCreate,
		uid,
		type,
		chartVersion,
		templateName
	} = props;
	const field = Field.useField();
	const [dataSource, setDataSource] = useState<ParamterItem[]>([]);
	const [current, setCurrent] = useState<string>();
	useEffect(() => {
		if (uid) {
			getParamsTemp({ type, chartVersion, uid, templateName }).then(
				(res) => {
					if (res.success) {
						const list = res.data.customConfigList.map(
							(item: any) => {
								item.modifiedValue =
									item.value || item.defaultValue;
								return item;
							}
						);
						setDataSource(list);
						if (!data || data === {}) {
							setCurrent(res.data.customConfigList[0].name);
							field.setValues({
								defaultValue: (
									res.data.customConfigList[0] as ParamterItem
								).defaultValue,
								modifiedValue: (
									res.data.customConfigList[0] as ParamterItem
								).modifiedValue,
								restart: (
									res.data.customConfigList[0] as ParamterItem
								).restart,
								ranges: (
									res.data.customConfigList[0] as ParamterItem
								).ranges,
								description: (
									res.data.customConfigList[0] as ParamterItem
								).description
							});
						}
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				}
			);
		} else {
			initParamsTemp({ type, chartVersion }).then((res) => {
				if (res.success) {
					const list = res.data.map((item: any) => {
						item.modifiedValue = item.defaultValue;
						item.value = item.defaultValue;
						return item;
					});
					setDataSource(list);
					if (!data || data === {}) {
						setCurrent(res.data[0].name);
						field.setValues({
							defaultValue: (res.data[0] as ParamterItem)
								.defaultValue,
							modifiedValue: (res.data[0] as ParamterItem)
								.modifiedValue,
							restart: (res.data[0] as ParamterItem).restart,
							ranges: (res.data[0] as ParamterItem).ranges,
							description: (res.data[0] as ParamterItem)
								.description
						});
					}
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, [type, chartVersion]);
	useEffect(() => {
		if (data && data !== {}) {
			setCurrent(data.name);
			field.setValues({
				defaultValue: data.defaultValue,
				modifiedValue: data.modifiedValue,
				restart: data.restart,
				ranges: data.ranges,
				description: data.description
			});
		}
	}, [data]);
	const onChange = (value: string) => {
		setCurrent(value);
		const cur = dataSource.find((item: any) => item.name === value);
		field.setValues({
			defaultValue: (cur as ParamterItem).defaultValue,
			modifiedValue: (cur as ParamterItem).modifiedValue,
			restart: (cur as ParamterItem).restart,
			ranges: (cur as ParamterItem).ranges,
			description: (cur as ParamterItem).description
		});
	};
	const onOk = () => {
		const flag = (field.getValues() as ParamterItem).name.trim();
		if (flag === '') {
			Message.show(messageConfig('error', '失败', '修改目标值不能为空'));
			return;
		}
		onCreate(field.getValues() as ParamterItem);
	};
	return (
		<Dialog
			title="编辑"
			visible={visible}
			onClose={onCancel}
			onCancel={onCancel}
			onOk={onOk}
			style={{ width: '460px' }}
		>
			<Form {...formItemLayout} field={field}>
				<FormItem label="参数名" labelTextAlign="left">
					<Select
						name="name"
						style={{ width: '100%' }}
						value={current}
						onChange={onChange}
					>
						{dataSource?.map((item: any) => {
							return (
								<Option key={item.name} value={item.name}>
									{item.name}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem label="参数默认值" labelTextAlign="left">
					<Input name="defaultValue" disabled />
				</FormItem>
				<FormItem label="修改目标值" labelTextAlign="left">
					<Input name="modifiedValue" />
				</FormItem>
				<FormItem label="是否要重启" labelTextAlign="left">
					<Checkbox name="restart" disabled />
				</FormItem>
				<FormItem label="参数值范围" labelTextAlign="left">
					<Input name="ranges" disabled />
				</FormItem>
				<FormItem label="参数描述" labelTextAlign="left">
					<Input.TextArea rows={3} name="description" disabled />
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default EditParamItem;
