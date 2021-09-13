import React, { useState } from 'react';
import { Message } from '@alicloud/console-components';
import SecondLayout from '@/components/SecondLayout';
import Log from '@/pages/InstanceList/Detail/Log';
import { getMiddlewareDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import NoService from '@/components/NoService';
import { middlewareDetailProps } from '@/types/comment';
interface basicDataProps {
	name: string;
	type: string;
	clusterId: string;
	namespace: string;
}
export default function LogDetail(): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const onChange = (
		name: string,
		type: string,
		clusterId: string,
		namespace: string
	) => {
		console.log(name, type, clusterId, namespace);
		if (name !== type) {
			setBasicData({
				name,
				type,
				clusterId,
				namespace
			});
			getMiddlewareDetail({
				clusterId,
				namespace,
				type,
				middlewareName: name
			}).then((res) => {
				console.log(res);
				if (res.success) {
					setIsService(true);
					setData(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		} else {
			setIsService(false);
		}
	};
	return (
		<SecondLayout
			title="日志详情"
			subTitle="用于中间件服务的日志查询"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService && data && JSON.stringify(data) !== '{}' && (
				<Log
					type={basicData?.type}
					data={data}
					middlewareName={basicData?.name}
					clusterId={basicData?.clusterId}
					namespace={basicData?.namespace}
					customMid={data?.dynamicValues !== null}
					capabilities={data?.capabilities || []}
				/>
			)}
			{!isService && <NoService />}
		</SecondLayout>
	);
}
