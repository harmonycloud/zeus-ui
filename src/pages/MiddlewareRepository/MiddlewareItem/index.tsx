import React from 'react';
import { Icon, Balloon, Message, Dialog } from '@alicloud/console-components';
import { useHistory } from 'react-router-dom';
import { api } from '@/api.json';
import { middlewareItemProps } from '../middleware';
import CustomIcon from '@/components/CustomIcon';
import { installMiddleware, unInstallMiddleware } from '@/services/repository';
import messageConfig from '@/components/messageConfig';
import otherColor from '@/assets/images/nodata.svg';
import './index.scss';

const statusIconRender = (value: number) => {
	switch (value) {
		case 0:
			return (
				<Balloon
					trigger={
						<Icon
							type="loading1"
							size="small"
							style={{ color: '#D1D5D9', marginLeft: '6px' }}
						/>
					}
					align="b"
					needAdjust={false}
					closable={false}
				>
					安装中
				</Balloon>
			);
		case 1:
			return (
				<Balloon
					trigger={
						<Icon
							type="success"
							size="small"
							style={{ color: '#1DC11D', marginLeft: '6px' }}
						/>
					}
					align="b"
					needAdjust={false}
					closable={false}
				>
					运行正常
				</Balloon>
			);
		case 2:
			return (
				<Balloon
					trigger={
						<Icon
							type="minus-circle-fill"
							size="small"
							style={{ color: '#FAC800', marginLeft: '6px' }}
						/>
					}
					align="b"
					needAdjust={false}
					closable={false}
				>
					待安装
				</Balloon>
			);
		case 3:
			return (
				<Balloon
					trigger={
						<Icon
							type="warning"
							size="small"
							style={{ color: '#D93026', marginLeft: '6px' }}
						/>
					}
					align="b"
					needAdjust={false}
					closable={false}
				>
					运行异常
				</Balloon>
			);
		case 4:
			return (
				<Balloon
					trigger={
						<Icon
							type="success"
							size="small"
							style={{ color: '#1DC11D', marginLeft: '6px' }}
						/>
					}
					align="b"
					needAdjust={false}
					closable={false}
				>
					运行正常
				</Balloon>
			);
		default:
			break;
	}
};

export default function MiddlewareItem(
	props: middlewareItemProps
): JSX.Element {
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
		version
	} = props;
	const history = useHistory();
	console.log(history);
	const toVersion = () => {
		history.push(`/middlewareRepository/versionManagement/${chartName}`);
	};
	const install = () => {
		const sendData = {
			chartName,
			chartVersion,
			clusterId
		};
		Dialog.show({
			title: '操作确认',
			content: '请确认是否安装该中间件？',
			onOk: () => {
				installMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'中间件安装成功，5秒后刷新数据'
							)
						);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
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
		Dialog.show({
			title: '操作确认',
			content: '请确认是否卸载该中间件？',
			onOk: () => {
				unInstallMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'中间件卸载成功，5秒后刷新数据'
							)
						);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	const releaseMiddleware = () => {
		if (official) {
			switch (chartName) {
				case 'mysql':
					history.push(
						`/middlewareRepository/mysqlCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'redis':
					history.push(
						`/middlewareRepository/redisCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'elasticsearch':
					history.push(
						`/middlewareRepository/elasticsearchCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'rocketmq':
					history.push(
						`/middlewareRepository/rocketmqCreate/${chartName}/${chartVersion}`
					);
					break;
				default:
					history.push(
						`/middlewareRepository/dynamicForm/${chartName}/${chartVersion}/${version}`
					);
					break;
			}
		} else {
			history.push(
				`/middlewareRepository/dynamicForm/${chartName}/${chartVersion}/${version}`
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
									<CustomIcon
										type="icon-banben"
										style={{ color: 'white' }}
									/>
									版本
								</div>
								<div
									className="middleware-item-action-item-two"
									onClick={install}
								>
									<CustomIcon
										type="icon-anzhuang"
										style={{ color: 'white' }}
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
									{/* <div className="middleware-item-action-icon"> */}
									<CustomIcon
										type="icon-banben"
										style={{ color: 'white' }}
									/>
									版本
									{/* </div> */}
								</div>
								<div
									className="middleware-item-action-item-two"
									onClick={unInstall}
								>
									<CustomIcon
										type="icon-xiezai1"
										style={{ color: 'white' }}
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
								<CustomIcon
									type="icon-fabu"
									style={{ color: 'white' }}
								/>
								发布
							</div>
						) : null}
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
				消息类型&nbsp;&nbsp;
				<Balloon
					trigger={
						<CustomIcon
							style={{
								color: '#0070cc',
								// marginLeft: '6px',
								visibility: official ? 'initial' : 'hidden'
							}}
							type="icon-guanfangrenzheng"
						/>
					}
					align="b"
					needAdjust={false}
					closable={false}
				>
					谐云官方认证
				</Balloon>
				{statusIconRender(status)}
			</div>
			<div className="middleware-item-description" title={description}>
				{description}
			</div>
		</div>
	);
}
