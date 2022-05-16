import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import EditQuotaForm from './EditQuotaForm';
import './index.scss';

export interface modeItemProps {
	data: {
		cpu: number;
		disabled: boolean;
		memory: number;
		num: number;
		specId: string;
		storageClass: string;
		storageQuota: number;
		title: string;
	};
	clusterId: string;
	namespace: string;
	type: string;
	onChange: (value: modeItemProps['data']) => void;
}
const ModeItem = (props: modeItemProps): JSX.Element => {
	const { data, clusterId, namespace, type, onChange } = props;
	const [modifyData, setModifyData] = useState<modeItemProps['data']>(data);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	const onCreate = (value: any) => {
		onChange(value);
		setModifyData({
			...modifyData,
			...value
		});
		setVisible(false);
	};
	useEffect(() => {
		onChange(modifyData);
	}, [modifyData]);
	const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setModifyData({
			...modifyData,
			num: Number(e.target.value)
		});
	};
	if (data.disabled) {
		return (
			<div className="mode-item-box">
				<div className="mode-item-title data-disabled">
					<span>{data.title}</span>
				</div>
				<div className="mode-item-data-disabled">未启用</div>
			</div>
		);
	} else {
		return (
			<div className="mode-item-box">
				<div className="mode-item-title">
					<span>{data.title}</span>
					{isEdit ? (
						<Input
							size="small"
							value={modifyData.num}
							type="number"
							bordered={false}
							onChange={inputChange}
							onBlur={() => setIsEdit(false)}
							autoFocus={true}
							min={
								data.title === '主节点' ||
								data.title === '数据节点'
									? 3
									: 1
							}
							className="mode-item-number-input"
						/>
					) : (
						<span
							className="mode-item-circle"
							onClick={() => setIsEdit(true)}
						>
							{modifyData.num}
						</span>
					)}
				</div>
				<div
					className="mode-item-data"
					onClick={() => setVisible(true)}
				>
					<ul>
						<li>
							<span>CPU：</span>
							<span>{data.cpu} Core</span>
						</li>
						<li>
							<span>内存：</span>
							<span>{data.memory} Gi</span>
						</li>
						{data.storageClass && data.storageClass !== '' && (
							<li>
								<span>{data.storageClass}：</span>
								<span>{data.storageQuota} GB</span>
							</li>
						)}
						{type !== 'kibana' &&
							type !== 'sentinel' &&
							!data.storageClass && (
								<li>
									<span style={{ color: '#D93026' }}>
										存储配额：未配置
									</span>
								</li>
							)}
					</ul>
				</div>
				{visible && (
					<EditQuotaForm
						visible={visible}
						onCancel={() => setVisible(false)}
						onCreate={onCreate}
						data={modifyData}
						clusterId={clusterId}
						namespace={namespace}
						type={type}
						onChange={onChange}
						inputChange={inputChange}
					/>
				)}
			</div>
		);
	}
};
export default ModeItem;
