import React, { useEffect } from 'react';
import { PageHeader, Modal } from 'antd';
import { useParams } from 'react-router';
import { IconFont } from '@/components/IconFont';
import redisImg from '@/assets/images/redis-icon.png';
import { OperatorHeaderProps, ParamsProps } from '../index.d';
import { authLogout } from '@/services/operatorPanel';

const { confirm } = Modal;
export default function OperatorHeader(
	props: OperatorHeaderProps
): JSX.Element {
	const params: ParamsProps = useParams();
	const { currentUser, loginOut } = props;
	useEffect(() => {
		window.onbeforeunload = (e) => {
			console.log(e);
			// authLogout({
			// 	clusterId: params.clusterId,
			// 	middlewareName: params.name,
			// 	namespace: params.namespace,
			// 	type: params.type
			// });
			// e.preventDefault();
			return 1;
		};
	}, []);
	return (
		<PageHeader
			title={params.name}
			avatar={{
				children:
					params.type !== 'redis' ? (
						<IconFont
							style={{ fontSize: 36, lineHeight: '55px' }}
							type="icon-SQL"
						/>
					) : (
						<img src={redisImg} />
					),
				shape: 'square',
				size: 48,
				style: { background: '#F5F5F5' }
			}}
			extra={
				<div>
					账户：{currentUser?.username || '未登录'}
					<span className="name-link ml-12">
						<span
							onClick={() => {
								confirm({
									title: '操作确认',
									content: '是否确认退出当前运维面板？',
									onOk: () => {
										// authLogout({
										// 	clusterId: params.clusterId,
										// 	middlewareName: params.name,
										// 	namespace: params.namespace,
										// 	type: params.type
										// }).finally(() => {
										window.close();
										// });
									}
								});
							}}
						>
							退出{' '}
						</span>{' '}
						/ <span onClick={loginOut}>切换账户</span>
					</span>
				</div>
			}
		/>
	);
}
