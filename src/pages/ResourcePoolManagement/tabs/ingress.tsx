import React, { useEffect, useState } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import { paramsProps } from '../detail';
import { getIngresses } from '@/services/common';
import { Message } from '@alifd/next';
import messageConfig from '@/components/messageConfig';
import { IngressItemProps } from '../resource.pool';
import IngressCard from '@/components/IngressCard';

const Ingress = () => {
	const { id }: paramsProps = useParams();
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getIngresses({ clusterId: id }).then((res) => {
			if (res.success) {
				setIngresses(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	return (
		<Page>
			<Content>
				<div className="ingresses-content">
					<IngressCard
						status={-1}
						onRefresh={getData}
						clusterId={id}
					/>
					{ingresses.map((item, index) => {
						return (
							<IngressCard
								key={index}
								title={item.ingressClassName}
								status={item.status}
								onRefresh={getData}
								clusterId={id}
								data={item}
							/>
						);
					})}
				</div>
			</Content>
		</Page>
	);
};
export default Ingress;
