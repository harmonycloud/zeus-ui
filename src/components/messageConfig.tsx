import React from 'react';
import { MessageQuickProps } from '@alicloud/console-components/types/message';

const messageConfig: (
	type: 'success' | 'warning' | 'error' | 'notice' | 'help' | 'loading',
	title: React.ReactNode,
	data: any
) => MessageQuickProps = (
	type: 'success' | 'warning' | 'error' | 'notice' | 'help' | 'loading',
	title: React.ReactNode,
	data: any
) => ({
	type: type,
	title: <div>{title}</div>,
	content: (
		<div className="message-box">
			<p>
				{data?.message ||
					data?.errorMsg ||
					data?.errorDetail ||
					data?.data ||
					data}
			</p>
		</div>
	),
	duration: 3000,
	align: 'tr tr',
	closeable: true,
	offset: [-24, 62]
});

export default messageConfig;
