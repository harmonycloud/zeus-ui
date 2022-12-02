import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import EditDirectory from './editDirectory';
import '../ModeItem/index.scss';

export interface modeItemProps {
	data: {
		title: string;
		disabled: boolean;
		hostPath: string;
		mountPath: string;
		volumeSize: number;
		storageClass: string | string[];
	};
	mode?: string;
	clusterId: string;
	namespace: string;
	type: string;
	onChange: (value: modeItemProps['data']) => void;
	middlewareType: string;
	disabled?: boolean;
}
const ModeItem = (props: modeItemProps): JSX.Element => {
	const {
		data,
		clusterId,
		namespace,
		type,
		mode,
		onChange,
		middlewareType,
		disabled
	} = props;
	const [modifyData, setModifyData] = useState<modeItemProps['data']>(data);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	const onCreate = (value: any) => {
		console.log(value);
		onChange(value);
		setModifyData({
			...modifyData,
			...value
		});
		setVisible(false);
	};
	useEffect(() => {
		setModifyData(data);
	}, [data]);
	useEffect(() => {
		onChange(modifyData);
	}, [modifyData]);
	const inputChange = (value: any) => {
		setModifyData({
			...modifyData
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
				</div>
				<div
					className="mode-item-data"
					onClick={() => setVisible(true)}
				>
					<ul>
						<li>
							<span>宿主机目录：</span>
							<span>{data.hostPath}</span>
						</li>
						<li>
							<span>容器内目录：</span>
							<span>{data.mountPath}</span>
						</li>
						<li>
							<span>存储：</span>
							<span>{data.storageClass}</span>
						</li>
						<li>
							<span>存储大小：</span>
							<span>{data.volumeSize}</span>
						</li>
					</ul>
				</div>
				{visible && (
					<EditDirectory
						middlewareType={middlewareType}
						visible={visible}
						onCancel={() => setVisible(false)}
						onCreate={onCreate}
						data={modifyData}
						clusterId={clusterId}
						namespace={namespace}
						type={type}
						mode={mode}
						onChange={onChange}
						inputChange={inputChange}
						disabled={disabled}
					/>
				)}
			</div>
		);
	}
};
export default ModeItem;
