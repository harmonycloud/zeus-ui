import React, { useState } from 'react';
import { Popover, Modal, notification } from 'antd';
import {
	LoadingOutlined,
	CheckCircleOutlined,
	MinusCircleOutlined,
	ExclamationCircleOutlined
} from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';

import { useHistory } from 'react-router-dom';
import { api } from '@/api.json';
import { connect } from 'react-redux';
import { middlewareItemProps } from '../middleware';

import { installMiddleware, unInstallMiddleware } from '@/services/repository';
import otherColor from '@/assets/images/nodata.svg';
import { StoreState } from '@/types/index';
import { setMenuRefresh } from '@/redux/menu/menu';
import OperatorInstallForm from '@/components/OperatorInstallForm/index';

import './index.scss';

const statusIconRender = (value: number) => {
	switch (value) {
		case 0:
			return (
				<Popover content="安装中" placement="bottom">
					{/* <Icon
						type="loading1"
						size="small"
						style={{ color: '#D1D5D9', marginLeft: '6px' }}
					/> */}
					<LoadingOutlined
						style={{
							color: '#D1D5D9',
							marginLeft: '6px',
							fontSize: '16px',
							verticalAlign: 'middle'
						}}
					/>
				</Popover>
			);
		case 1:
			return (
				<Popover content="运行正常" placement="bottom">
					{/* <Icon
						type="success"
						size="small"
						style={{ color: '#1DC11D', marginLeft: '6px' }}
					/> */}
					<CheckCircleOutlined
						style={{
							color: '#1DC11D',
							marginLeft: '6px',
							fontSize: '16px',
							verticalAlign: 'middle'
						}}
					/>
				</Popover>
			);
		case 2:
			return (
				<Popover content="待安装" placement="bottom">
					{/* <Icon
						type="minus-circle-fill"
						size="small"
						style={{ color: '#FAC800', marginLeft: '6px' }}
					/> */}
					<MinusCircleOutlined
						style={{
							color: '#FAC800',
							marginLeft: '6px',
							fontSize: '16px',
							verticalAlign: 'middle'
						}}
					/>
				</Popover>
			);
		case 3:
			return (
				<Popover content="运行异常" placement="bottom">
					{/* <Icon
						type="warning"
						size="small"
						style={{ color: '#D93026', marginLeft: '6px' }}
					/> */}
					<ExclamationCircleOutlined
						style={{
							color: '#D93026',
							marginLeft: '6px',
							fontSize: '16px',
							verticalAlign: 'middle'
						}}
					/>
				</Popover>
			);
		case 4:
			return (
				<Popover content="运行正常" placement="bottom">
					{/* <Icon
						type="success"
						size="small"
						style={{ color: '#1DC11D', marginLeft: '6px' }}
					/> */}
					<CheckCircleOutlined
						style={{
							color: '#1DC11D',
							marginLeft: '6px',
							fontSize: '16px',
							verticalAlign: 'middle'
						}}
					/>
				</Popover>
			);
		default:
			break;
	}
};

function MiddlewareItem(props: middlewareItemProps): JSX.Element {
	const {
		name,
		chartName,
		chartVersion,
		description,
		official,
		imagePath,
		status,
		clusterId,
		onRefresh,
		version,
		setMenuRefresh,
		replicas
	} = props;
	const history = useHistory();
	const toVersion = () => {
		history.push(`/middlewareRepository/versionManagement/${chartName}`);
	};
	const [visible, setVisible] = useState(false);

	const install = (sendData: any) => {
		installMiddleware(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '中间件安装成功，5秒后刷新数据'
				});
				setMenuRefresh(true);
				setVisible(false);
				onRefresh();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const unInstall = () => {
		const sendData = {
			chartName,
			chartVersion,
			clusterId
		};
		Modal.confirm({
			title: '操作确认',
			content: '请确认是否卸载该中间件？',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				unInstallMiddleware(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '中间件卸载成功，5秒后刷新数据'
						});
						setMenuRefresh(true);
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};

	// ! 该页面包含了所有中间件发布的页面逻辑，发布服务页面的路由已修改,但releaseMiddleware中的还未修改，需要后端在返回的数据中添加一个aliasName字段，存储中间件的大写值
	const releaseMiddleware = () => {
		if (official) {
			switch (chartName) {
				case 'mysql':
					history.push(
						`/serviceList/mysqlCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'redis':
					history.push(
						`/serviceList/redisCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'elasticsearch':
					history.push(
						`/serviceList/elasticsearchCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'rocketmq':
					history.push(
						`/serviceList/rocketmqCreate/${chartName}/${chartVersion}`
					);
					break;
				default:
					history.push(
						`/serviceList/dynamicForm/${chartName}/${chartVersion}/${version}`
					);
					break;
			}
		} else {
			history.push(
				`/serviceList/dynamicForm/${chartName}/${chartVersion}/${version}`
			);
		}
	};

	return (
		<div className="middleware-item-content">
			<div className="middleware-item-icon">
				<img
					height={60}
					width={60}
					src={
						imagePath
							? `${api}/images/middleware/${imagePath}`
							: otherColor
					}
					alt={name}
				/>
				{history.location.pathname === '/middlewareRepository' ? (
					<div className="middleware-item-action-content">
						{status === 2 ? (
							<>
								<div
									className="middleware-item-action-item-two"
									onClick={toVersion}
								>
									<IconFont
										type="icon-banben"
										style={{
											color: 'white',
											fontSize: '22px'
										}}
									/>
									版本
								</div>
								<div
									className="middleware-item-action-item-two"
									onClick={() => setVisible(true)}
								>
									<IconFont
										type="icon-anzhuang"
										style={{
											color: 'white',
											fontSize: '22px'
										}}
									/>
									安装
								</div>
							</>
						) : (
							<>
								<div
									className="middleware-item-action-item-two"
									onClick={toVersion}
								>
									<IconFont
										type="icon-banben"
										style={{
											color: 'white',
											fontSize: '22px'
										}}
									/>
									版本
								</div>
								<div
									className="middleware-item-action-item-two"
									onClick={unInstall}
								>
									<IconFont
										type="icon-xiezai1"
										style={{
											color: 'white',
											fontSize: '22px'
										}}
									/>
									卸载
								</div>
							</>
						)}
					</div>
				) : (
					<div className="middleware-item-action-content">
						{status !== 2 ? (
							<div
								className="middleware-item-action-item-one"
								onClick={releaseMiddleware}
							>
								<IconFont
									type="icon-fabu"
									style={{ color: 'white', fontSize: '22px' }}
								/>
								发布
							</div>
						) : null}
					</div>
				)}
				{status !== 2 && (
					<div className="middleware-item-type">
						<span className="middleware-item-type-text">
							{replicas && replicas > 1 ? '高' : '单'}
						</span>
					</div>
				)}
			</div>
			<div
				className="middleware-item-title"
				style={{ color: status === 2 ? '#CCCCCC' : '#333333' }}
			>
				{name} | {chartVersion}
			</div>
			<div
				className="middleware-item-status"
				style={{ color: status === 2 ? '#CCCCCC' : '#333333' }}
			>
				{name === 'kafka' || name === 'rocketmq'
					? '消息类型'
					: '数据库类型'}
				&nbsp;&nbsp;
				<Popover content="谐云官方认证" placement="bottom">
					<IconFont
						style={{
							color: '#0070cc',
							visibility: official ? 'initial' : 'hidden',
							fontSize: '20px',
							verticalAlign: 'middle'
						}}
						type="icon-guanfangrenzheng"
					/>
				</Popover>
				{statusIconRender(status)}
			</div>
			<div className="middleware-item-description" title={description}>
				{description}
			</div>
			<OperatorInstallForm
				visible={visible}
				clusterId={clusterId}
				chartName={chartName}
				chartVersion={chartVersion}
				onCreate={install}
				onCancel={() => setVisible(false)}
			/>
		</div>
	);
}
const mapStateToProps = (state: StoreState) => ({
	menu: state.menu
});
export default connect(mapStateToProps, {
	setMenuRefresh
})(MiddlewareItem);
