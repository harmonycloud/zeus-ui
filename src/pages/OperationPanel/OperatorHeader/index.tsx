import React, { useEffect, useState } from 'react';
import { PageHeader, Modal } from 'antd';
import { IconFont } from '@/components/IconFont';
import LoginConsole from './LoginConsole';
import { OperatorHeaderProps } from '../index.d';

const { confirm } = Modal;
export default function OperatorHeader(
	props: OperatorHeaderProps
): JSX.Element {
	const { currentUser } = props;
	return (
		<>
			<PageHeader
				title="test-mysql"
				avatar={{
					children: (
						<IconFont
							style={{ fontSize: 36, lineHeight: '55px' }}
							type="icon-SQL"
						/>
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
											window.close();
										}
									});
								}}
							>
								退出{' '}
							</span>{' '}
							/ <span>切换账户</span>
						</span>
					</div>
				}
			/>
		</>
	);
}
