import React, { useState } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { Button, Divider, Form, InputNumber, Select } from 'antd';
import SelectCard from '@/components/SelectCard';

const ingressTypeList = [
	{
		label: '只读',
		value: 'read',
		icon: 'icon-zhidu'
	},
	{
		label: '读写',
		value: 'write',
		icon: 'icon-duxie1'
	},
	{
		label: '读写分离',
		value: 'readwrite',
		icon: 'icon-duxiefenli'
	}
];

const formItemLayout = {
	labelCol: {
		span: 3
	},
	wrapperCol: {
		span: 10
	}
};

export default function AddIngress(): JSX.Element {
	const [ingressType, setIngressType] = useState<string>('read');
	const handleSubmit = () => {
		window.history.back();
	};
	return (
		<ProPage>
			<ProHeader
				title="服务暴露新增"
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Form {...formItemLayout} labelAlign="left">
					<h2>暴露服务</h2>
					<Form.Item
						label="暴露服务"
						rules={[
							{
								required: true,
								message: '请选择暴露服务'
							}
						]}
					>
						<SelectCard
							options={ingressTypeList}
							currentValue={ingressType}
							onCallBack={(value: any) => setIngressType(value)}
						/>
					</Form.Item>
					<h2>暴露方式</h2>
					<Form.Item
						label="暴露方式"
						rules={[
							{
								required: true,
								message: '请选择暴露方式'
							}
						]}
					>
						<Select placeholder="请选择暴露方式" />
					</Form.Item>
					<Form.Item
						label="负载均衡选择"
						rules={[
							{
								required: true,
								message: '请选择负载均衡'
							}
						]}
					>
						<Select placeholder="请选择负载均衡" />
					</Form.Item>
					<Form.Item
						label="对外端口配置"
						rules={[
							{
								required: true,
								message: '请输入对外端口'
							}
						]}
					>
						<InputNumber placeholder="对外端口" />
					</Form.Item>
					<Divider style={{ marginTop: 40 }} />
					<Button
						type="primary"
						onClick={handleSubmit}
						style={{ marginRight: 16 }}
					>
						确认
					</Button>
					<Button onClick={() => window.history.back()}>取消</Button>
				</Form>
			</ProContent>
		</ProPage>
	);
}
