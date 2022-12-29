import React, { useEffect, useState } from 'react';
import { getLists } from '@/services/storage';
import {
	GetParams,
	StorageItem
} from '@/pages/StorageManagement/storageManage';
import EditDirectory from './editDirectory';
import '../ModeItem/index.scss';

const titleMap = {
	pgdb: '数据目录',
	pgwal: 'wal日志目录',
	pglog: 'PostgreSQL日志目录',
	pgarch: 'wal日志归档目录',
	pgextension: 'PostgreSQL插件目录',
	'redis-data': '数据目录',
	'redis-logs': '日志目录'
};
export interface modeItemProps {
	data: {
		title: string;
		disabled: boolean;
		hostPath: string;
		mountPath: string;
		volumeSize: number;
		name: string;
		storageClass: string | string[];
		switch?: boolean;
	};
	mode?: string;
	clusterId: string;
	namespace: string;
	type: string;
	onChange: (value: modeItemProps['data']) => void;
	middlewareType: string;
	readOnly?: boolean;
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
		disabled,
		readOnly
	} = props;
	const [modifyData, setModifyData] = useState<modeItemProps['data']>(data);
	const [storageClassList, setStorageClassList] = useState<StorageItem[]>([]);
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		if (clusterId) {
			const sendData: GetParams = {
				all: false,
				clusterId: clusterId
			};
			getLists(sendData).then((res) => {
				if (res.success) {
					setStorageClassList(
						res.data?.filter(
							(item) =>
								item.provisioner === 'rancher.io/local-path'
						)
					);
				}
			});
		}
	}, [clusterId]);

	const onCreate = (value: any) => {
		const valueTemp = {
			...modifyData,
			...value
		};
		onChange(valueTemp);
		setModifyData(valueTemp);
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
	return (
		<div className="mode-item-box">
			<div className="mode-item-title">
				<span
					className={
						type === 'pgarch' ||
						type === 'pgextension' ||
						type === 'redis-logs'
							? 'align'
							: 'align ne-required'
					}
				>
					{data.title || titleMap[data.name]}
				</span>
			</div>
			<div
				className="mode-item-data"
				onClick={() => !readOnly && setVisible(true)}
			>
				<ul>
					{data.switch === false ? (
						<li>
							<span
								style={{
									color: '#d93026',
									display:
										(type === 'pgarch' ||
											type === 'pgextension' ||
											type === 'redis-logs') &&
										data.switch === false
											? 'initial'
											: 'none'
								}}
							>
								未启用
							</span>
						</li>
					) : (
						<>
							<li>
								<span>宿主机目录：</span>
								<span>{data.hostPath}</span>
							</li>
							<li>
								<span>容器内目录：</span>
								<span>{data.mountPath}</span>
							</li>
							{data.storageClass ? (
								<li>
									<span>存储：</span>
									<span>
										{
											storageClassList.find(
												(item) =>
													item.name ===
													data.storageClass
											)?.aliasName
										}
									</span>
								</li>
							) : (
								<li>
									<span style={{ color: '#D93026' }}>
										存储：未配置
									</span>
								</li>
							)}
							<li>
								<span>存储大小：</span>
								<span>{data.volumeSize} GB</span>
							</li>
						</>
					)}
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
					storageClassList={storageClassList}
				/>
			)}
		</div>
	);
};
export default ModeItem;
