import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tooltip, Switch, Button, Tag, Checkbox, Input } from 'antd';
import {
	QuestionCircleOutlined,
	PlusOutlined,
	CloseCircleFilled
} from '@ant-design/icons';
import {
	AffinityLabelsItem,
	AffinityProps
} from '@/pages/ServiceCatalog/catalog';

import './index.scss';

function Affinity(props: any): JSX.Element {
	const { values, onChange, flag, flagChange } = props;
	const [key, setKey] = useState<string>('');
	const [value, setValue] = useState<string>('');
	const [checked, setChecked] = useState<boolean>(false);

	return (
		<>
			<li className="display-flex form-li flex-align">
				<label className="form-name">
					<span style={{ marginRight: 8 }}>主机亲和</span>
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
						/>
					</div>
					{flag ? (
						<>
							<div className={'input'}>
								<Input
									placeholder="键"
									value={key}
									style={{ width: '140px' }}
									onChange={(e) => setKey(e.target.value)}
								/>
								<span style={{ margin: '0 8px' }}>=</span>
								<Input
									placeholder="值"
									value={value}
									style={{ width: '140px' }}
									onChange={(e) => setValue(e.target.value)}
								/>
							</div>
							<div className={'add'}>
								<Button
									style={{
										marginLeft: '4px',
										padding: '0 9px'
									}}
									disabled={key && value ? false : true}
									onClick={() => {
										if (
											!values.find(
												(item: any) =>
													item.label ===
													`${key}=${value}`
											)
										) {
											onChange([
												...values,
												{
													label: `${key}=${value}`,
													checked,
													id: Math.random()
												}
											]);
											setKey('');
											setValue('');
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
								<Checkbox
									checked={checked}
									onChange={(e) => {
										setChecked(e.target.checked);
										onChange(
											values.map((item: any) => {
												return {
													label: item.label,
													id: item.id,
													checked: e.target.checked
												};
											})
										);
									}}
								>
									强制亲和
								</Checkbox>
							</div>
						</>
					) : null}
				</div>
			</li>
			{flag && values.length ? (
				<div className={'tags'}>
					{values.map((item: any) => {
						return (
							<Tag
								key={item.label}
								closable
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
							// <p className={'tag'} key={item.label}>
							// 	<span>{item.label}</span>
							// 	<CloseCircleFilled
							// 		className={'tag-close'}
							// 		onClick={() => {
							// 			onChange(
							// 				values.filter(
							// 					(arr: any) => arr.id !== item.id
							// 				)
							// 			);
							// 		}}
							// 	/>
							// </p>
						);
					})}
				</div>
			) : null}
		</>
	);
}

export default Affinity;
