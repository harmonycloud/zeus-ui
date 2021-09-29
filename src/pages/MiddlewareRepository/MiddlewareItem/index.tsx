import React from 'react';
import { Icon, Balloon, Message, Dialog } from '@alicloud/console-components';
import { useHistory } from 'react-router-dom';
import { api } from '@/api.json';
import { middlewareItemProps } from '../middleware';
import CustomIcon from '@/components/CustomIcon';
import { installMiddleware, unInstallMiddleware } from '@/services/repository';
import messageConfig from '@/components/messageConfig';
import './index.scss';

const statusMap = {
	0: '创建中',
	1: '创建成功',
	2: '待安装',
	3: '运行异常'
};
const statusIconRender = (value: number) => {
	switch (value) {
		case 0:
			return (
				<Icon
					type="loading1"
					size="small"
					style={{ color: '#D1D5D9', marginLeft: '6px' }}
				/>
			);
		case 1:
			return (
				<Icon
					type="success"
					size="small"
					style={{ color: '#1DC11D', marginLeft: '6px' }}
				/>
			);
		case 2:
			return (
				<Icon
					type="minus-circle-fill"
					size="small"
					style={{ color: '#FAC800', marginLeft: '6px' }}
				/>
			);
		case 3:
			return (
				<Icon
					type="warning"
					size="small"
					style={{ color: '#D93026', marginLeft: '6px' }}
				/>
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
								'中间件安装成功，3秒后刷新数据'
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
			content: '请确认是否下架该中间件？',
			onOk: () => {
				unInstallMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'中间件下架成功，3秒后刷新数据'
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
				{console.log(`${api}/images/middleware/${imagePath}`)}
				<img
					height={60}
					width={60}
					src={`${api}/images/middleware/${imagePath}`}
					alt={name}
				/>
				<div className="middleware-item-action-content">
					{status === 2 ? (
						<div
							className="middleware-item-action-item-one"
							onClick={install}
						>
							<CustomIcon
								type="icon-anzhuang"
								style={{ color: 'white' }}
							/>
							安装
						</div>
					) : (
						<>
							<div
								className="middleware-item-action-item"
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
								className="middleware-item-action-item"
								onClick={unInstall}
							>
								<CustomIcon
									type="icon-xiezai1"
									style={{ color: 'white' }}
								/>
								卸载
							</div>
							<div
								className="middleware-item-action-item"
								onClick={releaseMiddleware}
							>
								<CustomIcon
									type="icon-fabu"
									style={{ color: 'white' }}
								/>
								发布
							</div>
						</>
					)}
				</div>
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
				消息类型：
				<Balloon
					trigger={
						<CustomIcon
							style={{
								color: '#0064C8',
								marginLeft: '6px',
								visibility: official ? 'initial' : 'hidden'
							}}
							type="icon-guanfangrenzheng"
						/>
					}
					align="b"
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
