import React, { useState, useEffect } from 'react';
import { Balloon, Icon, Form, Input } from '@alicloud/console-components';
import './index.scss';
import UserConfig from './userConfig';
import { rocketMQAccount } from './acl';

const { Item: FormItem } = Form;
function RocketACLForm(props: any): JSX.Element {
	const { field, data } = props;
	const list =
		data?.rocketMQAccountList.map((item: any) => {
			return {
				id: Number(Math.random() * 100),
				...item
			};
		}) || [];
	const [userConfigs, setUserConfigs] = useState<rocketMQAccount[]>(
		data
			? list
			: [
					{
						id: Number(Math.random() * 100),
						accessKey: '',
						admin: false,
						whiteRemoteAddress: '',
						secretKey: '',
						groupPerms: {
							defaultGroupPerm: 'DENY'
						},
						topicPerms: {
							defaultTopicPerm: 'DENY'
						}
					}
			  ]
	);
	useEffect(() => {
		if (data) {
			field.setValues({
				globalWhiteRemoteAddresses: data.globalWhiteRemoteAddresses
			});
		}
	}, [data]);
	const deleteUserConfig = (id: number) => {
		const userConfigTemps = userConfigs.filter((item) => item.id !== id);
		setUserConfigs(userConfigTemps);
	};
	const addUserConfig = () => {
		const userConfigTemps = [
			...userConfigs,
			{
				id: Number(Math.random() * 100),
				accessKey: '',
				admin: false,
				whiteRemoteAddress: '',
				secretKey: '',
				groupPerms: {
					defaultGroupPerm: 'DENY'
				},
				topicPerms: {
					defaultTopicPerm: 'DENY'
				}
			}
		];
		setUserConfigs(userConfigTemps);
	};
	const handleSetUserConfig = (
		values: rocketMQAccount,
		id: number | string
	) => {
		const userConfigsTemp = userConfigs.map((item) => {
			if (item.id === id) {
				item = values;
			}
			return item;
		});
		setUserConfigs(userConfigsTemp);
		const list = userConfigsTemp.map((item) => {
			return {
				accessKey: item.accessKey,
				admin: item.admin,
				whiteRemoteAddress: item.whiteRemoteAddress,
				secretKey: item.secretKey,
				groupPerms: item.groupPerms,
				topicPerms: item.topicPerms
			};
		});
		field.setValue('rocketMQAccountList', list);
	};
	return (
		<ul className="form-layout">
			<li className="display-flex">
				<label className="form-name">
					<span style={{ marginRight: 8 }}>全局IP白名单</span>
					<Balloon
						trigger={<Icon type="question-circle" size="xs" />}
						closable={false}
					>
						<span
							style={{
								lineHeight: '18px'
							}}
						>
							• 可为空，表示不设置白名单，该条规则默认返回false。
							<br />
							•支持使用“*”，表示全部匹配，该条规则直接返回true，将会阻断其他规则的判断，请慎重使用。
							<br />
							•
							支持使用“;”，表式分隔多个IP，如，192.168.1.100;192.168.2.100
							<br />
							• 支持使用 &quot;&quot;
							或&quot;-&quot;表示范围，如192.168.*.1或者192.168.100-200.10-202种表达都可
							<br />
						</span>
					</Balloon>
				</label>
				<div className="form-content">
					<FormItem
						maxLength={200}
						minmaxLengthMessage="可以输入多个IP，输入字符不能超过200个"
					>
						<Input
							name="globalWhiteRemoteAddresses"
							style={{ width: '375px' }}
							placeholder="请输入全局IP白名单，支持输入多个IP"
							maxLength={200}
						/>
					</FormItem>
				</div>
			</li>
			<li className="display-flex">
				<label className="form-name">
					<span style={{ marginRight: 8 }}>账户信息配置</span>
				</label>
				<div className="form-content">
					{userConfigs.map((item) => {
						return (
							<FormItem key={item.id}>
								<UserConfig
									name="rocketMQAccountList"
									userConfig={item}
									deleteUserConfigProps={deleteUserConfig}
									setUserConfig={(value) =>
										handleSetUserConfig(value, item.id)
									}
								/>
							</FormItem>
						);
					})}
					<div
						className="acl-add-user-config"
						onClick={addUserConfig}
					>
						<Icon type="add1" size="small" />
						<span>添加账户信息配置</span>
					</div>
				</div>
			</li>
		</ul>
	);
}
export default RocketACLForm;
