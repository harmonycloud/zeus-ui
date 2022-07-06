import React, { useState, useEffect } from 'react';
import { Form, AutoComplete, Button, Switch, Tag } from 'antd';
import { PlusOutlined, CloseCircleFilled } from '@ant-design/icons';
import { getNodeTaint } from '@/services/middleware';
import {
	FormTolerationsProps,
	TolerationLabelItem,
	TolerationsProps
} from './formTolerations';
import { AutoCompleteOptionItem } from '@/types/comment';
import './index.scss';

const { Item: FormItem } = Form;

/*
	FormNodeTolerations：动态表单中的主机容忍组件
*/
export default function FormTolerations(
	props: FormTolerationsProps
): JSX.Element {
	const { cluster } = props;
	const keys = Object.keys(props);
	// * 主机容忍
	const [tolerations, setTolerations] = useState<TolerationsProps>({
		nodeTolerations: props.default,
		nodeTolerationsLabel: '',
		nodeTolerationsForce: false
	});
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [tolerationsLabels, setTolerationsLabels] = useState<
		TolerationLabelItem[]
	>([]);

	useEffect(() => {
		if (JSON.stringify(cluster) !== '{}') {
			getNodeTaint({ clusterid: cluster.id }).then((res) => {
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

	const changeTolerations = (value: any, key: string) => {
		setTolerations({
			...tolerations,
			[key]: value
		});
	};

	const addTolerationsLabels = () => {
		if (
			!tolerationsLabels.find(
				(item) => item.label === tolerations.nodeTolerationsLabel
			)
		) {
			setTolerationsLabels([
				...tolerationsLabels,
				{ label: tolerations.nodeTolerationsLabel, id: Math.random() }
			]);
			props.form.setFieldsValue({
				tolerations: [
					...tolerationsLabels,
					{
						label: tolerations.nodeTolerationsLabel
					}
				]
			});
			changeTolerations('', 'nodeTolerationsLabel');
		}
	};

	const reduceTolerationsLabels = (item: TolerationLabelItem) => {
		setTolerationsLabels(
			tolerationsLabels.filter((arr) => arr.id !== item.id)
		);
		props.form.setFieldsValue({
			tolerations: tolerationsLabels.filter((arr) => arr.id !== item.id)
		});
	};

	return (
		<div className="display-flex flex-column form-tolerations">
			<label
				className="dynamic-form-name"
				style={keys.includes('required') ? { paddingLeft: 8 } : {}}
			>
				<span
					className={keys.includes('required') ? 'ne-required' : ''}
				>
					主机容忍
				</span>
			</label>
			<div className="form-content">
				<FormItem
					rules={[
						{
							required:
								keys.includes('required') && props.required,
							message:
								keys.includes('required') && props.required
									? `请输入${props.label}`
									: ''
						}
					]}
					name={props.variable}
					initialValue={props.nodeTolerations}
				>
					<label className="dynamic-switch-label">
						{tolerations.nodeTolerations ? '已开启' : '已关闭 '}
					</label>
					<Switch
						checked={tolerations.nodeTolerations}
						onChange={(value) =>
							changeTolerations(value, 'nodeTolerations')
						}
						size="small"
						style={{
							marginLeft: 24,
							verticalAlign: 'middle'
						}}
					/>
					{tolerations.nodeTolerations ? (
						<>
							<div
								className="dynamic-form-node-tolerations-content"
								style={{ marginLeft: 24 }}
							>
								<AutoComplete
									value={tolerations.nodeTolerationsLabel}
									onChange={(value) =>
										changeTolerations(
											value,
											'nodeTolerationsLabel'
										)
									}
									options={labelList}
									style={{
										width: '100%'
									}}
								/>
							</div>
							<div className={'add'}>
								<Button
									style={{
										marginLeft: '4px',
										padding: '0 9px'
									}}
									disabled={
										tolerations.nodeTolerationsLabel
											? false
											: true
									}
									onClick={addTolerationsLabels}
									icon={
										<PlusOutlined
											style={{ color: '#005AA5' }}
										/>
									}
								></Button>
							</div>
						</>
					) : null}
				</FormItem>
				{tolerations.nodeTolerations && tolerationsLabels.length ? (
					<div className={'tags'}>
						{tolerationsLabels.map((item) => {
							return (
								<Tag
									key={item.label}
									closable
									style={{
										padding: '4px 10px'
									}}
									onClose={() =>
										reduceTolerationsLabels(item)
									}
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
