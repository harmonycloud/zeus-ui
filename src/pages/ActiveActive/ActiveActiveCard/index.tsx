import React from 'react';
import { Form, Input, Popconfirm, Progress } from 'antd';
import noData1 from '@/assets/images/active-bg1.svg';
import noData2 from '@/assets/images/active-bg2.svg';
import noData3 from '@/assets/images/active-bg3.svg';
import noData4 from '@/assets/images/active-bg4.svg';
import { ZonesItem } from '../activeActive';
import { EditOutlined, RightOutlined } from '@ant-design/icons';
import './index.scss';
interface NoDataCardProps {
	title: string;
	onClick: (data: ZonesItem) => void;
	data: ZonesItem;
}
interface ActiveDataProps {
	title: string;
	onClick: (data: ZonesItem) => void;
	handleEdit: (value: any, name: string) => void;
	data: ZonesItem;
}
export const NoDataCard: (props: NoDataCardProps) => JSX.Element = (
	props: NoDataCardProps
) => {
	const { title, onClick, data } = props;
	return (
		<div className="zeus-active-no-data-card" onClick={() => onClick(data)}>
			<div className="zeus-active-no-data-title-content">
				<img className="zeus-active-no-data-bg1" src={noData4} />
				<img className="zeus-active-no-data-bg2" src={noData3} />
				<div className="zeus-active-no-data-title">
					<div className="zeus-active-data-label">{title}</div>
				</div>
			</div>
			<div className="zeus-active-no-data-info-content">
				立即进行节点初始化配置
			</div>
		</div>
	);
};
export const ActiveDataCard = (props: ActiveDataProps) => {
	const { title, onClick, handleEdit, data } = props;
	const [form] = Form.useForm();
	return (
		<div className="zeus-active-data-card">
			<div className="zeus-active-data-title-content">
				<img className="zeus-active-data-bg1" src={noData2} />
				<img className="zeus-active-data-bg2" src={noData1} />
				<div className="zeus-active-data-title">
					<div className="display-flex flex-align">
						<div className="zeus-active-data-label">{title}</div>
						<Popconfirm
							title={
								<Form form={form}>
									<Form.Item name="aliasName">
										<Input
											placeholder="请输入"
											defaultValue={title}
										/>
									</Form.Item>
								</Form>
							}
							icon={null}
							onConfirm={() =>
								handleEdit(form.getFieldsValue(), 'aliasName')
							}
						>
							<EditOutlined
								style={{
									marginLeft: 8,
									cursor: 'pointer',
									fontSize: 14,
									verticalAlign: 'middle',
									color: '#ffffff'
								}}
							/>
						</Popconfirm>
					</div>
					<div
						className="zeus-active-data-to-detail"
						onClick={() => onClick(data)}
					>
						<RightOutlined style={{ fontSize: 14 }} />
					</div>
				</div>
			</div>
			<div
				className="zeus-active-data-info-content"
				onClick={() => onClick(data)}
			>
				<div className="zeus-active-data-status">
					可用区状态
					<div
						className={`zeus-active-data-status-circle ${
							data.errorNodeCount === 0 ? 'success' : 'error'
						}`}
					></div>
					{data.errorNodeCount === 0 ? '正常' : '异常'}
				</div>
				<div className="zeus-active-data-source-content">
					<p>CPU(核)</p>
					<Progress percent={data.cpuRate || 0} size="small" />
					<p>
						<strong style={{ fontSize: 16 }}>{data.cpuUsed}</strong>{' '}
						/{data.cpuTotal}核
					</p>
				</div>
				<div className="zeus-active-data-source-content">
					<p>内存(GB)</p>
					<Progress
						strokeColor="#FFAA3A"
						percent={data.memoryRate || 0}
						size="small"
					/>
					<p>
						<strong style={{ fontSize: 16 }}>
							{data.memoryUsed}
						</strong>{' '}
						/{data.memoryTotal}核
					</p>
				</div>
			</div>
		</div>
	);
};
