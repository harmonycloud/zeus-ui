import React, { useState } from 'react';
import { Collapse } from 'antd';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import './index.scss';
import { CloseOutlined } from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';
import ActiveCard from './ActiveCard';

const { Panel } = Collapse;
export default function ActiveActive(): JSX.Element {
	const [panelVisible, setPanelVisible] = useState<boolean>(true);
	const [panel1Visible, setPanel1Visible] = useState<boolean>(true);
	const genExtra = (record: number) => (
		<CloseOutlined
			onClick={(event) => {
				record === 0 ? setPanelVisible(false) : setPanel1Visible(false);
				// If you don't want click extra trigger collapse, you can prevent this:
				event.stopPropagation();
			}}
		/>
	);
	return (
		<ProPage>
			<ProHeader
				avatar={{
					icon: (
						<IconFont
							type="icon-tongchengshuanghuo"
							style={{ fontSize: 28 }}
						/>
					),
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
				}}
				title="同城双活"
				subTitle="针对不同集群内的可用区进行管理"
			/>
			<ProContent className="active-active-box">
				<Collapse className="site-collapse-custom-collapse">
					{panelVisible && (
						<Panel
							className="site-collapse-custom-panel"
							key="0"
							header="什么是同城双活？"
							extra={genExtra(0)}
						>
							同城双活是基于谐云的云原生产品的基础上，可以做到业务轻松实现跨数据中心同城双活，故障秒级切换，数据强一致性，同时业务零改造。
						</Panel>
					)}
					{panel1Visible && (
						<Panel
							className="site-collapse-custom-panel"
							key="1"
							header="什么是可用区？"
							extra={genExtra(1)}
						>
							可用区是指在同城双活场景下，中心概念的载体，通过可用区的划分来数据中心，实现跨数据中心同城双活。
						</Panel>
					)}
				</Collapse>
				<div className="active-list-content">
					<ActiveCard
						title="集群名字"
						isActive={true}
						areaNumber={4}
						status={1}
					/>
				</div>
			</ProContent>
		</ProPage>
	);
}
