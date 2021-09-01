import React, { useState, useEffect } from 'react';
import DataFields from '@alicloud/console-components-data-fields';

const itemsConfig = [
	{ dataIndex: 'accessKey', label: '账户' },
	{ dataIndex: 'secretKey', label: '密码' },
	{
		dataIndex: 'admin',
		label: '是否为Admin',
		render: (val: boolean) => (val ? '是' : '否')
	},
	{ dataIndex: 'whiteRemoteAddress', label: '用户IP白名单' },
	{ dataIndex: 'topics', label: 'Topic权限' },
	{ dataIndex: 'groups', label: '消费者权限' }
];
interface UserInfoProps {
	data: any;
}
export default function RocketAclUserInfo(props: UserInfoProps): JSX.Element {
	const { data } = props;
	const [infoData, setInfoData] = useState(data);
	useEffect(() => {
		const topics = Object.entries(data.topicPerms)
			.map((item) => `${item[0]}=${item[1]}`)
			.join('、');
		const groups = Object.entries(data.groupPerms)
			.map((item) => `${item[0]}=${item[1]}`)
			.join('、');
		setInfoData({
			// ...infoData,
			accessKey: infoData.accessKey || '',
			secretKey: infoData.secretKey || '',
			admin: infoData.admin || '',
			whiteRemoteAddress: infoData.whiteRemoteAddress || '',
			topics,
			groups
		});
	}, [data]);
	return (
		<>
			<div className="detail-divider-dash" />
			<DataFields dataSource={infoData} items={itemsConfig} />
		</>
	);
}
