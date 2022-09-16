import { Modal, Space } from 'antd';
import React, { useState } from 'react';
import { IconFont } from '../IconFont';
import './index.scss';

interface SelectedTypeProps {
	visible: boolean;
	onCancel: () => void;
	onCreate: (type: string) => void;
}
const ingressTypeList = [
	{
		label: 'Nginx',
		value: 'nginx',
		icon: 'icon-nginx'
	},
	{
		label: 'Traefik',
		value: 'traefik',
		icon: 'icon-traefik'
	}
];
export default function SelectedType(props: SelectedTypeProps): JSX.Element {
	const { visible, onCancel, onCreate } = props;
	const [selected, setSelected] = useState<string>('nginx');
	const onOk = () => {
		onCreate(selected);
	};
	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			title="选择负载均衡类型"
			onOk={onOk}
		>
			<div className="ingress-type-content">
				{ingressTypeList.map((item) => (
					<div
						key={item.value}
						className={`ingress-type-box ${
							selected === item.value
								? 'ingress-type-box-active'
								: ''
						}`}
						onClick={() => setSelected(item.value)}
					>
						<IconFont
							type={item.icon}
							style={{ fontSize: 24, marginBottom: 8 }}
						/>
						{item.label}
					</div>
				))}
			</div>
		</Modal>
	);
}
