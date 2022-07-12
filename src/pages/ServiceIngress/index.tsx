import React from 'react';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import ProTable from '@/components/ProTable';

export default function ServiceIngress(): JSX.Element {
	return (
		<ProPage>
			<ProHeader
				title="服务暴露"
				subTitle="通过Nginx-Ingress/NodePort等多种方式对外暴露已发布的不同类型中间件服务"
			/>
			<ProContent>
				<ProTable>
					<ProTable.Column
						dataIndex="middlewareName"
						title="服务名称"
					/>
					<ProTable.Column
						dataIndex="middlewareType"
						title="服务类型"
					/>
					<ProTable.Column dataIndex="exposeType" title="暴露方式" />
					<ProTable.Column dataIndex="middleware" title="暴露服务" />
					<ProTable.Column dataIndex="ip" title="暴露IP/域名/端口" />
					<ProTable.Column dataIndex="action" title="操作" />
				</ProTable>
			</ProContent>
		</ProPage>
	);
}
