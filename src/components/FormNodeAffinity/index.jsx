import React, { useState, useEffect } from 'react';
import {
	Balloon,
	Icon,
	Form,
	Select,
	Checkbox,
	Switch,
	Button
} from '@alicloud/console-components';
import { getNodePort } from '@/services/middleware';
import './index.scss';

const { Item: FormItem } = Form;

/*
	FormNodeAffinity：动态表单中的主机亲和组件
*/
export default function FormNodeAffinity(props) {
	const { cluster } = props;
	const keys = Object.keys(props);
	// * 主机亲和
	const [affinity, setAffinity] = useState({
		nodeAffinity: props.default,
		nodeAffinityLabel: '',
		nodeAffinityForce: false
	});
	const [labelList, setLabelList] = useState([]);
	const [affinityLabels, setAffinityLabels] = useState([]);

	useEffect(() => {
		if (JSON.stringify(cluster) !== '{}') {
			getNodePort({ clusterId: cluster.id }).then((res) => {
				if (res.success) {
					setLabelList(res.data);
				}
			});
		}
	}, [cluster]);

	const changeAffinity = (value, key) => {
		setAffinity({
			...affinity,
			[key]: value
		});
		props.field.setValues({
			[key]: value
		});
	};

	const addAffinityLabels = () => {
		if (
			!affinityLabels.find(
				(item) => item.label === affinity.nodeAffinityLabel
			)
		) {
			setAffinityLabels([
				...affinityLabels,
				{ label: affinity.nodeAffinityLabel, id: Math.random() }
			]);
			props.field.setValues({
				nodeAffinityLabel: [
					...affinityLabels,
					{ label: affinity.nodeAffinityLabel, id: Math.random() }
				]
			});
			setAffinity({ ...affinity, nodeAffinityLabel: '' });
		}
	};

	const reduceAffinityLabels = (item) => {
		setAffinityLabels(affinityLabels.filter((arr) => arr.id !== item.id));
		props.field.setValues({
			affinityLabels: affinityLabels.filter((arr) => arr.id !== item.id)
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
					<Balloon
						offset={[0, 15]}
						align="t"
						trigger={
							<Icon
								type="question-circle"
								size="xs"
								style={{ marginLeft: 8 }}
							/>
						}
						closable={false}
					>
						{props.description}
					</Balloon>
				) : null}
			</label>
			<div className="form-content">
				<FormItem
					required={keys.includes('required') && props.required}
					requiredMessage={
						keys.includes('required') && props.required
							? `请输入${props.label}`
							: ''
					}
				>
					<label className="dynamic-switch-label">
						{affinity.nodeAffinity ? '已开启' : '已关闭 '}
					</label>
					<Switch
						checked={affinity.nodeAffinity}
						name={props.variable}
						onChange={(value) =>
							changeAffinity(value, 'nodeAffinity')
						}
						size="small"
						style={{
							marginLeft: 24,
							verticalAlign: 'middle'
						}}
					/>
					{affinity.nodeAffinity ? (
						<>
							<div className="dynamic-form-node-affinity-content">
								<Select.AutoComplete
									value={affinity.nodeAffinityLabel}
									onChange={(value) =>
										changeAffinity(
											value,
											'nodeAffinityLabel'
										)
									}
									dataSource={labelList}
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
										affinity.nodeAffinityLabel
											? false
											: true
									}
									onClick={addAffinityLabels}
								>
									<Icon
										style={{ color: '#005AA5' }}
										type="add"
									/>
								</Button>
							</div>
							<div className="dynamic-form-node-affinity-check">
								<Checkbox
									checked={affinity.nodeAffinityForce}
									onChange={(value) =>
										changeAffinity(
											value,
											'nodeAffinityForce'
										)
									}
									label="强制亲和"
								/>
							</div>
						</>
					) : null}
				</FormItem>
				{affinity.nodeAffinity && affinityLabels.length ? (
					<div className={'tags'}>
						{affinityLabels.map((item) => {
							return (
								<p className={'tag'} key={item.id}>
									<span>{item.label}</span>
									<Icon
										type="error"
										size="xs"
										className={'tag-close'}
										onClick={() =>
											reduceAffinityLabels(item)
										}
									/>
								</p>
							);
						})}
					</div>
				) : null}
			</div>
		</div>
	);
}
