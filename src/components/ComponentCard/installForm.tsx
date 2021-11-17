import React, { useState } from 'react';
import { Dialog } from '@alicloud/console-components';
import CustomIcon from '../CustomIcon';
import { SendDataProps } from './index';
import './index.scss';

interface installFormProps {
	visible: boolean;
	title: string;
	clusterId: string;
	onCancel: () => void;
	onCreate: (values: SendDataProps) => void;
}
const InstallForm = (props: installFormProps) => {
	const { visible, onCancel, clusterId, title, onCreate } = props;
	const [type, setType] = useState<string>('high');
	const onOk = () => {
		const sendData = {
			clusterId,
			componentName: title,
			type: type
		};
		onCreate(sendData);
		onCancel();
	};
	return (
		<Dialog
			title="工具安装"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '474px' }}
		>
			<div className="install-title-content">
				<div className="install-title-name">选择安装规格</div>
			</div>
			<p className="install-subtitle">
				依据您资源池资源的富余情况进行灵活选择
			</p>
			<div
				className="install-item"
				style={type === 'simple' ? { border: '1px solid #0064C8' } : {}}
				onClick={() => setType('simple')}
			>
				<div>
					<CustomIcon
						type="icon-renwushili"
						style={
							type === 'simple'
								? { width: 80, fontSize: 80, color: '#0064C8' }
								: { width: 80, fontSize: 80, color: '#666666' }
						}
					/>
				</div>
				<div className="install-item-info">
					<h2>单实例版</h2>
					<p>
						资源占用少，保证安装后，该工具可用，但是不稳定
						所需资源约CPU：**核；内存：**G；存储**G
					</p>
					<CustomIcon
						type="icon-xuanzhong"
						style={
							type === 'simple'
								? { position: 'absolute', right: 0, bottom: 0 }
								: { visibility: 'hidden' }
						}
					/>
				</div>
			</div>
			<div
				className="install-item"
				style={type === 'high' ? { border: '1px solid #0064C8' } : {}}
				onClick={() => setType('high')}
			>
				<div>
					<CustomIcon
						type="icon-gaokeyong"
						style={
							type === 'high'
								? { width: 80, fontSize: 80, color: '#0064C8' }
								: { width: 80, fontSize: 80, color: '#666666' }
						}
					/>
				</div>
				<div className="install-item-info">
					<h2>高可用版（推荐）</h2>
					<p>
						资源占用相对多，保证安装后，该工具可用，且稳定
						所需资源约CPU：**核；内存：**G；存储**G
					</p>
					<CustomIcon
						type="icon-xuanzhong"
						style={
							type === 'high'
								? { position: 'absolute', right: 0, bottom: 0 }
								: { visibility: 'hidden' }
						}
					/>
				</div>
			</div>
		</Dialog>
	);
};
export default InstallForm;
