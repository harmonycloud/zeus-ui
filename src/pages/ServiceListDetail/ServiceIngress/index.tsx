import React from 'react';
import { useHistory } from 'react-router';
import ProList from '@/components/ProList';
import { Button } from 'antd';
import { ListCard, ListCardItem } from '@/components/ListCard';
import ArrowLine from '@/components/ArrowLine';
import Actions from '@/components/Actions';
import { IconFont } from '@/components/IconFont';
import { ServiceDetailIngressProps } from '../detail';
import DefaultPicture from '@/components/DefaultPicture';

const LinkButton = Actions.LinkButton;
export default function ServiceDetailIngress(
	props: ServiceDetailIngressProps
): JSX.Element {
	const {
		name,
		aliasName,
		middlewareName,
		namespace,
		chartVersion,
		customMid,
		capabilities,
		clusterId,
		mode,
		brokerNum
	} = props;
	const history = useHistory();
	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
					// kfk mq 的添加服务暴露页不同
					if (name === 'kafka' || name === 'rocketmq') {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/kfkmq/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${brokerNum}`
						);
					} else {
						history.push(
							`/serviceList/${name}/${aliasName}/externalAccess/add/msrdpgzk/${middlewareName}/${clusterId}/${chartVersion}/${namespace}/${mode}`
						);
					}
				}}
			>
				新增
			</Button>
		)
	};
	// * 当前中间件为自定义中间件时，且后端所传的capabilities包含ingress，则显示该页面的功能
	if (customMid && !capabilities.includes('ingress')) {
		return <DefaultPicture />;
	}
	return (
		<ProList operation={Operation}>
			<ListCard
				title="MySQL-test"
				subTitle="MySQL"
				icon={undefined}
				actionRender={
					<Actions>
						<LinkButton>编辑</LinkButton>
						<LinkButton>删除</LinkButton>
					</Actions>
				}
				columnGap="24px"
			>
				<ArrowLine width="calc((100% - 350px) / 2)" label="只读" />
				<ListCardItem width={100} label="暴露方式" value="TCP" />
				<ArrowLine width="calc((100% - 350px) / 2)" />
				<ListCardItem
					width={250}
					label="四层网络暴露"
					value="30088"
					icon={
						<IconFont
							type="icon-duankou"
							style={{ fontSize: 32, marginRight: 8 }}
						/>
					}
				/>
			</ListCard>
			<ListCard title="MySQL-test" subTitle="MySQL" icon={undefined}>
				<ListCardItem label="暴露方式" value="TCP" />
			</ListCard>
		</ProList>
	);
}
