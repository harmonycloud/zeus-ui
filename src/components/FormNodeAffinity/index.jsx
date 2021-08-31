import React, { useState, useEffect } from 'react';
import {
	Balloon,
	Icon,
	Form,
	Select,
	Checkbox,
	Switch
} from '@alicloud/console-components';
import { getNodePort } from '@/services/middleware';

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

	return (
		<div className="display-flex flex-column">
			<label
				className="dynamic-form-name"
				style={keys.includes('required') ? { paddingLeft: 8 } : {}}
			>
				<span
					className={keys.includes('required') ? 'ne-required' : ''}
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
					required={keys.includes('required')}
					requiredMessage={
						keys.includes('required') ? `请输入${props.label}` : ''
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
			</div>
		</div>
	);
}
