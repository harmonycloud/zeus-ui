import * as React from 'react';
import { useState, useEffect } from 'react';
import {
	Tooltip,
	Switch,
	Button,
	Tag,
	Checkbox,
	Input,
	AutoComplete
} from 'antd';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoCompleteOptionItem } from '@/types/comment';
import { getNodePort } from '@/services/middleware';

import './index.scss';

function Affinity(props: any): JSX.Element {
	const { values, onChange, flag, flagChange, cluster, disabled, isAnti } =
		props;
	const [label, setLabel] = useState<string>('');
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [checked, setChecked] = useState<boolean>(false);

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

	return (
		<>
			<li className="display-flex form-li flex-align">
				<label className="form-name">
					<span style={{ marginRight: 8 }}>
						{isAnti ? '主机反亲和' : '主机亲和'}
					</span>
					<Tooltip title="勾选强制亲和时，服务只会部署在具备相应标签的主机上，若主机资源不足，可能会导致启动失败">
						<QuestionCircleOutlined />
					</Tooltip>
				</label>
				<div className={`form-content display-flex host-affinity`}>
					<div className={'switch'}>
						{flag ? '已开启' : '关闭'}
						<Switch
							checked={flag}
							onChange={(value) => flagChange(value)}
							size="small"
							style={{
								margin: '0 16px',
								verticalAlign: 'middle'
							}}
							disabled={disabled}
						/>
					</div>
					{flag ? (
						<>
							<div className={'input'}>
								<AutoComplete
									allowClear
									placeholder="请输入key=value格式的内容"
									value={label}
									style={{ width: 260 }}
									options={labelList}
									onChange={(value) => setLabel(value)}
									onBlur={() => {
										label &&
											/^[a-zA-Z0-9-./_]+[=]([a-zA-Z0-9-./_]+)?$/.test(
												label
											) &&
											!values.find(
												(item: any) =>
													item.label === label
											) &&
											onChange([
												...values,
												{
													label: label,
													checked,
													anti: isAnti ? true : false,
													id: Math.random()
												}
											]);
									}}
									status={
										label &&
										!/^[a-zA-Z0-9-./_]+[=]([a-zA-Z0-9-./_]+)?$/.test(
											label
										)
											? 'error'
											: ''
									}
									disabled={disabled}
								/>
							</div>
							<div className={'add'}>
								<Button
									style={{
										marginLeft: '4px',
										padding: '0 9px'
									}}
									disabled={
										disabled ||
										!label ||
										!/^[a-zA-Z0-9-./_]+[=]([a-zA-Z0-9-./_]+)?$/.test(
											label
										)
											? true
											: false
									}
									onClick={() => {
										if (
											!values.find(
												(item: any) =>
													item.label === label
											)
										) {
											onChange([
												...values,
												{
													label: label,
													checked,
													anti: isAnti ? true : false,
													id: Math.random()
												}
											]);
										}
									}}
								>
									<PlusOutlined
										style={{
											color: '#005AA5'
										}}
									/>
								</Button>
							</div>
							<div className={'check'}>
								{console.log(values[0])}
								<Checkbox
									checked={
										values[0]?.checked ||
										values[0]?.required ||
										checked
									}
									onChange={(e) => {
										setChecked(e.target.checked);
										onChange(
											values.map((item: any) => {
												return {
													label: item.label,
													id: item.id,
													anti: isAnti ? true : false,
													checked: e.target.checked
												};
											})
										);
									}}
									disabled={disabled}
								>
									{isAnti ? '强制反亲和' : '强制亲和'}
								</Checkbox>
							</div>
						</>
					) : null}
				</div>
			</li>
			{label &&
			!/^[a-zA-Z0-9-./_]+[=]([a-zA-Z0-9-./_]+)?$/.test(label) ? (
				<div style={{ marginLeft: 240, color: '#ff4d4f' }}>
					请输入key=value格式的内容
				</div>
			) : null}
			{flag && values.length ? (
				<div className={'tags'}>
					{values.map((item: any) => {
						return (
							<Tag
								key={item.label}
								closable={!disabled}
								style={{ padding: '4px 10px' }}
								onClose={(e: React.MouseEvent<HTMLElement>) => {
									e.preventDefault();
									onChange(
										values.filter(
											(arr: any) => arr.id !== item.id
										)
									);
								}}
							>
								{item.label}
							</Tag>
						);
					})}
				</div>
			) : null}
		</>
	);
}

export default Affinity;
