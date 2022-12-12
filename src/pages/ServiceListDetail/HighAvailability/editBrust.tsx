import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Select, Progress } from 'antd';
import { IconFont } from '@/components/IconFont';

export default function EditBrust(props: any): JSX.Element {
	const { open, onCancel, onOk, burstList, onChange, selectSlave } = props;
	return (
		<Modal
			open={open}
			title="主从切换"
			width={450}
			onCancel={onCancel}
			onOk={onOk}
		>
			{console.log(selectSlave, open)}
			<div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center'
					}}
				>
					<p style={{ width: '45%' }}>
						分片选择（主节点 -&gt; 从节点）：
					</p>
					<Select
						style={{
							width: '55%'
						}}
						placeholder="请选择分片"
						value={selectSlave}
						onChange={onChange}
					>
						{burstList.map((item: string) => {
							return (
								<Select.Option key={item} value={item}>
									{item}
								</Select.Option>
							);
						})}
					</Select>
				</div>
				<p
					style={{
						color: '#ff4d4f',
						margin: '12px 0 24px 0'
					}}
				>
					主备服务切换过程中可能会有闪断，请确保您的应用程序具有自动重连机制
				</p>
				{selectSlave ? (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between'
						}}
					>
						<div className="master-cards">
							<div className="master-card blue">
								<Progress
									width={16}
									type="dashboard"
									gapDegree={40}
									percent={100}
									format={() => '主'}
									gapPosition="top"
									className="circle"
									strokeColor="#ddd"
									style={{ marginLeft: 4 }}
								/>
								<div>{selectSlave?.split(' -> ')[0]}</div>
							</div>
							<div className="master-card">
								<Progress
									width={16}
									type="dashboard"
									gapDegree={40}
									percent={100}
									format={() => '次'}
									gapPosition="top"
									className="circle blue"
									strokeColor="#78b5ff"
									style={{ marginLeft: 4 }}
								/>
								<div>{selectSlave?.split(' -> ')[0]}</div>
							</div>
						</div>
						<div className="icons">
							<IconFont
								type="icon-huilaiback48"
								style={{ color: '#226ee7' }}
								className="back-icon"
							/>
							<IconFont type="icon-huilaiback48" />
						</div>
						<div className="master-cards">
							<div className="master-card">
								<Progress
									width={16}
									type="dashboard"
									gapDegree={40}
									percent={100}
									format={() => '次'}
									gapPosition="top"
									className="circle blue"
									strokeColor="#78b5ff"
									style={{ marginLeft: 4 }}
								/>
								<div>{selectSlave?.split(' -> ')[0]}</div>
							</div>
							<div className="master-card blue">
								<Progress
									width={16}
									type="dashboard"
									gapDegree={40}
									percent={100}
									format={() => '主'}
									gapPosition="top"
									className="circle"
									strokeColor="#ddd"
									style={{ marginLeft: 4 }}
								/>
								<div>{selectSlave?.split(' -> ')[0]}</div>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</Modal>
	);
}
