import React from 'react';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';

export default function ServiceIngress(): JSX.Element {
	return (
		<ProPage>
			<ProHeader
				title="服务暴露"
				subTitle="通过Nginx-Ingress/NodePort等多种方式对外暴露已发布的不同类型中间件服务"
			/>
			<ProContent>
				<div></div>
			</ProContent>
		</ProPage>
	);
}
