import React, { useState, useEffect } from 'react';
import {
	Icon,
	Form,
	Select,
	Switch,
	Button
} from '@alicloud/console-components';
import { getNodeTaint } from '@/services/middleware';
import {
	FormTolerationsProps,
	TolerationLabelItem,
	TolerationsProps
} from './formTolerations';
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
	const [labelList, setLabelList] = useState<string[]>([]);
	const [tolerationsLabels, setTolerationsLabels] = useState<
		TolerationLabelItem[]
	>([]);

	useEffect(() => {
		if (JSON.stringify(cluster) !== '{}') {
			getNodeTaint({ clusterid: cluster.id }).then((res) => {
				if (res.success) {
					setLabelList(res.data);
				}
			});
		}
	}, [cluster]);

	const changeTolerations = (value: any, key: string) => {
		setTolerations({
			...tolerations,
			[key]: value
		});
		props.field.setValues({
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
			props.field.setValues({
				tolerationsLabels: [
					...tolerationsLabels,
					{
						label: tolerations.nodeTolerationsLabel,
						id: Math.random()
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
		props.field.setValues({
			tolerationsLabels: tolerationsLabels.filter(
				(arr) => arr.id !== item.id
			)
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
					required={keys.includes('required')}
					requiredMessage={
						keys.includes('required') ? `请输入${props.label}` : ''
					}
				>
					<label className="dynamic-switch-label">
						{tolerations.nodeTolerations ? '已开启' : '已关闭 '}
					</label>
					<Switch
						checked={tolerations.nodeTolerations}
						name={props.variable}
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
								<Select.AutoComplete
									value={tolerations.nodeTolerationsLabel}
									onChange={(value) =>
										changeTolerations(
											value,
											'nodeTolerationsLabel'
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
										tolerations.nodeTolerationsLabel
											? false
											: true
									}
									onClick={addTolerationsLabels}
								>
									<Icon
										style={{ color: '#005AA5' }}
										type="add"
									/>
								</Button>
							</div>
						</>
					) : null}
				</FormItem>
				{tolerations.nodeTolerations && tolerationsLabels.length ? (
					<div className={'tags'}>
						{tolerationsLabels.map((item) => {
							return (
								<p className={'tag'} key={item.id}>
									<span>{item.label}</span>
									<Icon
										type="error"
										size="xs"
										className={'tag-close'}
										onClick={() =>
											reduceTolerationsLabels(item)
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
