import React, { useState, useEffect } from 'react';
import {
	Form,
	AutoComplete,
	Checkbox,
	Button,
	Switch,
	Popover,
	Tag,
	Input
} from 'antd';
import {
	QuestionCircleOutlined,
	PlusOutlined,
	CloseCircleFilled
} from '@ant-design/icons';

import { getNodePort } from '@/services/middleware';
import { AutoCompleteOptionItem } from '@/types/comment';
import {
	FormNodeAffinityProps,
	NodeAffinityProps,
	NodeAffinityLabelItem
} from './formNodeAffinity';

import './index.scss';

const { Item: FormItem } = Form;

/*
	FormNodeAffinity：动态表单中的主机亲和组件
*/
export default function FormNodeAffinity(
	props: FormNodeAffinityProps
): JSX.Element {
	const { cluster } = props;
	const keys = Object.keys(props);
	// * 主机亲和
	const [affinity, setAffinity] = useState<NodeAffinityProps>({
		nodeAffinity: props.default,
		nodeAffinityLabel: '',
		nodeAffinityForce: false
	});
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [affinityLabels, setAffinityLabels] = useState<
		NodeAffinityLabelItem[]
	>([]);

	useEffect(() => {
		if (JSON.stringify(cluster) !== '{}') {
			getNodePort({ clusterId: cluster.id }).then((res) => {
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
		}
	}, [cluster]);

	const changeAffinity = (value: string | boolean, key: string) => {
		setAffinity({
			...affinity,
			[key]: value
		});
		if (
			key === 'nodeAffinityForce' &&
			typeof props.form.getFieldValue('nodeAffinity') === 'object'
		) {
			const data = props.form
				.getFieldValue('nodeAffinity')
				.map((item: any) => {
					return {
						...item,
						required: value
					};
				});
			props.form.setFieldsValue({
				nodeAffinity: data
			});
		}
	};

	const addAffinityLabels = () => {
		if (
			!affinityLabels.find(
				(item: any) => item.label === affinity.nodeAffinityLabel
			)
		) {
			setAffinityLabels([
				...affinityLabels,
				{
					label: affinity.nodeAffinityLabel,
					id: Math.random(),
					required: affinity.nodeAffinityForce
				}
			]);
			props.form.setFieldsValue({
				nodeAffinity: [
					...affinityLabels,
					{
						label: affinity.nodeAffinityLabel,
						required: affinity.nodeAffinityForce
					}
				]
			});
		}
	};

	const reduceAffinityLabels = (item: any) => {
		setAffinityLabels(
			affinityLabels.filter((arr: any) => arr.id !== item.id)
		);
		props.form.setFieldsValue({
			nodeAffinity: affinityLabels.filter(
				(arr: any) => arr.id !== item.id
			)
		});
	};

	return (
		<div className="display-flex flex-column node-affinity">
			<label
				className="dynamic-form-name"
				style={
					keys.includes('required') && props.required
						? { paddingLeft: 8 }
						: {}
				}
			>
				<span
					className={
						keys.includes('required') && props.required
							? 'ne-required'
							: ''
					}
				>
					{props.label}
				</span>
				{keys.includes('description') ? (
					<Popover
						// offset={[0, 15]}
						content={props.description}
					>
						<QuestionCircleOutlined style={{ marginLeft: 8 }} />
					</Popover>
				) : null}
			</label>
			<div className="form-content">
				<label className="dynamic-switch-label">
					{affinity.nodeAffinity ? '已开启' : '已关闭 '}
				</label>
				<Switch
					checked={affinity.nodeAffinity}
					onChange={(value) => changeAffinity(value, 'nodeAffinity')}
					size="small"
					style={{
						marginLeft: 24,
						verticalAlign: 'middle'
					}}
				/>
				{affinity.nodeAffinity ? (
					<>
						<div className="dynamic-form-node-affinity-content">
							<FormItem
								rules={[
									{
										required:
											keys.includes('required') &&
											props.required,
										message:
											keys.includes('required') &&
											props.required
												? `请输入${props.label}`
												: ''
									}
								]}
								name={props.variable}
								// initialValue={props.nodeAffinity}
							>
								<Input
									placeholder="键"
									// value={key}
									style={{ width: '140px' }}
									// onChange={(e) => setKey(e.target.value)}
								/>
								<span style={{ margin: '0 8px' }}>=</span>
								<Input
									placeholder="值"
									// value={value}
									style={{ width: '140px' }}
									// onChange={(e) => setValue(e.target.value)}
								/>
								{/* <AutoComplete
									value={affinity.nodeAffinityLabel}
									onChange={(value) =>
										changeAffinity(
											value,
											'nodeAffinityLabel'
										)
									}
									allowClear={true}
									options={labelList}
									style={{
										width: '100%'
									}}
								/> */}
							</FormItem>
						</div>
						<div className={'add'}>
							<Button
								style={{
									marginLeft: '4px',
									padding: '0 9px'
								}}
								disabled={
									affinity.nodeAffinityLabel ? false : true
								}
								onClick={addAffinityLabels}
								icon={
									<PlusOutlined
										style={{ color: '#005AA5' }}
									/>
								}
							></Button>
						</div>
						<div className="dynamic-form-node-affinity-check">
							<Checkbox
								checked={affinity.nodeAffinityForce}
								onChange={(e) =>
									changeAffinity(
										e.target.checked,
										'nodeAffinityForce'
									)
								}
							>
								强制亲和
							</Checkbox>
						</div>
					</>
				) : null}
				{affinity.nodeAffinity && affinityLabels.length ? (
					<div className={'tags'}>
						{affinityLabels.map((item: any) => {
							return (
								<Tag
									key={item.label}
									closable
									style={{ padding: '4px 10px' }}
									onClose={(
										e: React.MouseEvent<HTMLElement>
									) => {
										e.preventDefault();
										reduceAffinityLabels(item);
									}}
								>
									{item.label}
								</Tag>
							);
						})}
					</div>
				) : null}
			</div>
		</div>
	);
}
