import React, { useState, useEffect } from 'react';
import { Balloon } from '@alicloud/console-components';
import DataFields from '@alicloud/console-components-data-fields';

const Tooltip = Balloon.Tooltip;
const itemsConfig = [
	{ dataIndex: 'accessKey', label: '账户' },
	{
		dataIndex: 'admin',
		label: '是否为Admin',
		render: (val: boolean) => (val ? '是' : '否')
	},
	{ dataIndex: 'secretKey', label: '密码' },
	{ dataIndex: 'whiteRemoteAddress', label: '用户IP白名单' },
	{
		dataIndex: 'topics',
		label: 'Topic权限',
		render: (val: string) => {
			const list = val?.split(';');
			if (list) {
				return (
					<Tooltip align="t" trigger={<span>{list[1]}</span>}>
						{list[0]}
					</Tooltip>
				);
			}
		}
	},
	{
		dataIndex: 'groups',
		label: '消费者权限',
		render: (val: string) => {
			const list = val?.split(';');
			if (list) {
				return (
					<Tooltip align="t" trigger={<span>{list[1]}</span>}>
						{list[0]}
					</Tooltip>
				);
			}
		}
	}
];
interface UserInfoProps {
	data: any;
}
export default function RocketAclUserInfo(props: UserInfoProps): JSX.Element {
	const { data } = props;
	const [infoData, setInfoData] = useState(data);
	useEffect(() => {
		const topicKey = Object.entries(data.topicPerms);
		const groupKey = Object.entries(data.groupPerms);
		topicKey.length = topicKey.length > 2 ? 2 : topicKey.length;
		groupKey.length = groupKey.length > 2 ? 2 : groupKey.length;
		const ouch1 = topicKey.length === 2 ? '...' : '';
		const ouch2 = groupKey.length === 2 ? '...' : '';
		const topics =
			Object.entries(data.topicPerms)
				.map((item) => `${item[0]}=${item[1]}`)
				.join('、') +
			';' +
			topicKey.map((item) => `${item[0]}=${item[1]}`).join('、') +
			ouch1;
		const groups =
			Object.entries(data.groupPerms)
				.map((item) => `${item[0]}=${item[1]}`)
				.join('、') +
			';' +
			groupKey.map((item) => `${item[0]}=${item[1]}`).join('、') +
			ouch2;
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
