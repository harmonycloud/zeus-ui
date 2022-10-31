import React, { useState, useEffect } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import DataFields from '@/components/DataFields';
import { IconFont } from '@/components/IconFont';
import { Button, Input, notification } from 'antd';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import { getGaugeOption } from '@/utils/echartsOption';
import * as echarts from 'echarts/core';
import { editLicenseInfo, getLicenseInfo } from '@/services/user';

import './index.scss';

const info = {
	title: '基础信息',
	user: '授权用户',
	type: '授权类型',
	key: '唯一识别码'
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
		label: '授权用户'
	},
	{
		dataIndex: 'type',
		label: '授权类型'
	},
	{
		dataIndex: 'code',
		label: '唯一识别码'
	}
];

function AuthorManage(): JSX.Element {
	const [basicData, setBasicData] = useState(info);
	const [infoConfig, setInfoConfig] = useState(InfoConfig);
	const [option1, setOption1] = useState(getGaugeOption(0, 'CPU(核)'));
	const [option2, setOption2] = useState(getGaugeOption(0, '内存(GB)'));
	const [clusterQuota, setClusterQuota] = useState<any>();
	const [license, setLicense] = useState<string>('');

	const getData = () => {
		getLicenseInfo().then((res) => {
			if (res.success) {
				setBasicData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const submit = () => {
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
								CPU限量总额：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
								C
							</div>
							<div>
								CPU已使用：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
								C
							</div>
							<div>
								CPU剩余额度：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
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
								CPU限量总额：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
								C
							</div>
							<div>
								CPU已使用：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
								C
							</div>
							<div>
								CPU剩余额度：
								{(Number(clusterQuota?.totalCpu) || 0).toFixed(
									2
								)}
								C
							</div>
						</div>
					</div>
				</div>
				<h2>授权申请</h2>
				<Input.TextArea
					placeholder="请输入内容"
					value={license}
					onChange={(e) => setLicense(e.target.value)}
				/>
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
