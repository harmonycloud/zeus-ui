import React from 'react';

const messageConfig = (type, title, data) => ({
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
