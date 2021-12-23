import React from 'react';
import { Icon, Balloon, Message, Dialog } from '@alicloud/console-components';
import { useHistory } from 'react-router-dom';
import { api } from '@/api.json';
import { connect } from 'react-redux';
import { middlewareItemProps } from '../middleware';
import CustomIcon from '@/components/CustomIcon';
import { installMiddleware, unInstallMiddleware } from '@/services/repository';
import messageConfig from '@/components/messageConfig';
import otherColor from '@/assets/images/nodata.svg';
import { StoreState } from '@/types/index';
import { setMenuRefresh } from '@/redux/menu/menu';
import './index.scss';

const Tooltip = Balloon.Tooltip;
const statusIconRender = (value: number) => {
	switch (value) {
		case 0:
			return (
				<Tooltip
					trigger={
						<Icon
							type="loading1"
							size="small"
							style={{ color: '#D1D5D9', marginLeft: '6px' }}
						/>
					}
					align="b"
				>
					安装中
				</Tooltip>
			);
		case 1:
			return (
				<Tooltip
					trigger={
						<Icon
							type="success"
							size="small"
							style={{ color: '#1DC11D', marginLeft: '6px' }}
						/>
					}
					align="b"
				>
					运行正常
				</Tooltip>
			);
		case 2:
			return (
				<Tooltip
					trigger={
						<Icon
							type="minus-circle-fill"
							size="small"
							style={{ color: '#FAC800', marginLeft: '6px' }}
						/>
					}
					align="b"
				>
					待安装
				</Tooltip>
			);
		case 3:
			return (
				<Tooltip
					trigger={
						<Icon
							type="warning"
							size="small"
							style={{ color: '#D93026', marginLeft: '6px' }}
						/>
					}
					align="b"
				>
					运行异常
				</Tooltip>
			);
		case 4:
			return (
				<Tooltip
					trigger={
						<Icon
							type="success"
							size="small"
							style={{ color: '#1DC11D', marginLeft: '6px' }}
						/>
					}
					align="b"
				>
					运行正常
				</Tooltip>
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
		menu
	} = props;
	const history = useHistory();
	// console.log(setMenuRefresh, menu);
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
						setMenuRefresh(true);
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
						setMenuRefresh(true);
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
				{name === 'kafka' || name === 'rocketmq'
					? '消息类型'
					: '数据库类型'}
				&nbsp;&nbsp;
				<Tooltip
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
				>
					谐云官方认证
				</Tooltip>
				{statusIconRender(status)}
			</div>
			<div className="middleware-item-description" title={description}>
				{description}
			</div>
		</div>
	);
}
const mapStateToProps = (state: StoreState) => ({
	menu: state.menu
});
export default connect(mapStateToProps, {
	setMenuRefresh
})(MiddlewareItem);
