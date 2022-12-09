import React, { useState, useEffect } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import DataFields from '@/components/DataFields';
import { IconFont } from '@/components/IconFont';
import { Button, Form, Input, notification } from 'antd';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import { getGaugeOption } from '@/utils/echartsOption';
import * as echarts from 'echarts/core';
import { editLicenseInfo, getLicenseInfo } from '@/services/user';

import './index.scss';

const info = {
	title: '基础信息',
	user: '',
	type: '',
	key: ''
};

const InfoConfig = [
	{
		dataIndex: 'title',
		render: (val: string) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'user',
		label: '授权用户',
		render: (val: string) => val || '/'
	},
	{
		dataIndex: 'type',
		label: '授权类型',
		render: (val: string) => val || '/'
	},
	{
		dataIndex: 'code',
		label: '唯一识别码',
		render: (val: string) => val || '/'
	}
];

function AuthorManage(): JSX.Element {
	const [form] = Form.useForm();
	const [basicData, setBasicData] = useState<any>(info);
	const [infoConfig, setInfoConfig] = useState(InfoConfig);
	const [option1, setOption1] = useState(getGaugeOption(0, 'CPU(核)'));
	const [option2, setOption2] = useState(getGaugeOption(0, '内存(GB)'));
	const [clusterQuota, setClusterQuota] = useState<any>();
	const [license, setLicense] = useState<string>('');

	const getData = () => {
		getLicenseInfo().then((res) => {
			if (res.success) {
				setBasicData({ ...info, ...res.data });
				const cpuProduceRate = res.data
					? Number(res.data?.produce?.used) /
					  Number(res.data?.produce?.total)
					: 0;
				const option1Temp = getGaugeOption(cpuProduceRate, 'CPU(核)');
				setOption1(option1Temp);
				const cpuTestRate = res.data
					? Number(res.data?.test?.used) /
					  Number(res.data?.test?.total)
					: 0;
				const option2Temp = getGaugeOption(cpuTestRate, 'CPU(核)');
				setOption2(option2Temp);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const submit = () => {
		form.validateFields().then(() => {
			editLicenseInfo({ license }).then((res) => {
				if (res.success) {
					getData();
					notification.success({
						message: '成功',
						description: '授权成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<ProPage className="author-manage">
			<ProHeader
				avatar={{
					icon: (
						<IconFont
							type="icon-shouquanguanli"
							style={{ fontSize: 28, color: '#D4DAE6' }}
						/>
					),
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
				}}
				title="授权管理"
			/>
			<ProContent>
				<DataFields dataSource={basicData} items={infoConfig} />
				<h2>资源概览</h2>
				<div className="resource-overview">
					<div className="resource-overview-item">
						<ReactEChartsCore
							echarts={echarts}
							option={option1}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: 'calc(100% - 360px)'
							}}
						/>
						<div className="resource-overview-info">
							<div className="info-item">生产环境：</div>
							<div>
								<span
									style={{
										width: '100px',
										display: 'inline-block'
									}}
								>
									CPU限量总额：
								</span>
								{basicData?.produce?.total?.toFixed(2) || 0}C
							</div>
							<div>
								<span
									style={{
										width: '100px',
										display: 'inline-block'
									}}
								>
									CPU已使用：
								</span>
								{basicData?.produce?.used?.toFixed(2) || 0}C
							</div>
							<div>
								<span
									style={{
										width: '100px',
										display: 'inline-block'
									}}
								>
									CPU剩余额度：
								</span>
								{basicData?.produce?.total
									? (
											basicData?.produce?.total -
											basicData?.produce?.used
									  )?.toFixed(2)
									: 0}
								C
							</div>
						</div>
					</div>
					<div className="resource-overview-item">
						<ReactEChartsCore
							echarts={echarts}
							option={option2}
							notMerge={true}
							lazyUpdate={true}
							style={{
								height: '100%',
								width: 'calc(100% - 360px)'
							}}
						/>
						<div className="resource-overview-info">
							<div className="info-item">测试环境：</div>
							<div>
								<span
									style={{
										width: '100px',
										display: 'inline-block'
									}}
								>
									CPU限量总额：
								</span>
								{basicData?.test?.total?.toFixed(2) || 0}C
							</div>
							<div>
								<span
									style={{
										width: '100px',
										display: 'inline-block'
									}}
								>
									CPU已使用：
								</span>
								{basicData?.test?.used?.toFixed(2) || 0}C
							</div>
							<div>
								<span
									style={{
										width: '100px',
										display: 'inline-block'
									}}
								>
									CPU剩余额度：
								</span>
								{basicData?.test?.total
									? (
											basicData?.test?.total -
											basicData?.test?.used
									  )?.toFixed(2)
									: 0}
								C
							</div>
						</div>
					</div>
				</div>
				<h2>授权申请</h2>
				<Form form={form}>
					<Form.Item
						name="license"
						rules={[
							{
								required: true,
								message: '请输入内容'
							}
						]}
					>
						<Input.TextArea
							placeholder="请输入内容"
							value={license}
							onChange={(e) => setLicense(e.target.value)}
						/>
					</Form.Item>
				</Form>
				<Button
					type="primary"
					style={{ marginTop: 8 }}
					onClick={submit}
				>
					立即授权
				</Button>
				<h2>联系我们</h2>
				<div className="contact">
					<div className="contact-item">
						<div>
							<img src="" />
						</div>
						钉钉扫码或点击获取授权
					</div>
					<div className="contact-item">
						<div>
							<img src="" />
						</div>
						钉钉扫码加入社群
					</div>
				</div>
			</ProContent>
		</ProPage>
	);
}

export default AuthorManage;
