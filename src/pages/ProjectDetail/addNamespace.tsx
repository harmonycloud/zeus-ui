import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Radio,
	Select,
	Message
} from '@alicloud/console-components';
import { AddNamespaceProps } from './projectDetail';
import { formItemLayout618 } from '@/utils/const';
import { getClusters } from '@/services/common';
import { clusterType } from '@/types';
import messageConfig from '@/components/messageConfig';
const list = [
	{
		value: 'create',
		label: '创建命名空间'
	},
	{
		value: 'access',
		label: '接入命名空间'
	}
];
const FormItem = Form.Item;
const { Group: RadioGroup } = Radio;
const Option = Select.Option;
export default function AddNamespace(props: AddNamespaceProps): JSX.Element {
	const { visible, onCancel, onRefresh } = props;
	const [source, setSource] = useState<string>('create');
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const field = Field.useField();
	useEffect(() => {
		getClusters({ detail: true, key: '' }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	const onOk = () => {
		console.log('ok');
	};
	return (
		<Dialog
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			title="新增/接入"
			style={{ width: '550px' }}
		>
			<Form {...formItemLayout618} field={field}>
				<FormItem
					label="选择操作:"
					required
					requiredMessage="选择操作必填"
				>
					<RadioGroup
						name="source"
						dataSource={list}
						value={source}
						onChange={(value: string | number | boolean) => {
							setSource(value as string);
						}}
					/>
				</FormItem>
				{source === 'create' && (
					<FormItem
						label="命名空间名称:"
						required
						requiredMessage="命名空间名称必填"
						maxLength={64}
						minmaxLengthMessage="请输入名称，且最大长度不超过64个字符"
					>
						<Input id="aliasName" name="aliasName" />
					</FormItem>
				)}
				{source === 'create' && (
					<FormItem
						label="英文简称:"
						required
						requiredMessage="英文简称必填"
						pattern={'^[a-z][a-z0-9-]{0,61}[a-z0-9]$'}
						patternMessage={
							'命名空间是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-63个字符'
						}
					>
						<Input id="name" name="name" />
					</FormItem>
				)}
				<FormItem label="绑定项目">
					<Select disabled={true}></Select>
				</FormItem>
				<FormItem
					label="绑定集群"
					required
					requiredMessage="英文简称必填"
				>
					<Select
						defaultValue={clusterList[0]?.id}
						name="clusterId"
						style={{ width: '100%' }}
					>
						{clusterList.map((item: clusterType) => {
							return (
								<Option key={item.id} value={item.id}>
									{item.name}
								</Option>
							);
						})}
					</Select>
				</FormItem>
			</Form>
		</Dialog>
	);
}
