import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@alicloud/console-components';
import { Page, Content } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import { paramsProps } from '../detail';
import { getIngresses } from '@/services/common';
import { Message } from '@alifd/next';
import messageConfig from '@/components/messageConfig';
import { IngressItemProps } from '../resource.pool';
import IngressCard from '@/components/IngressCard';
import { connect } from 'react-redux';
import { setRefreshCluster } from '@/redux/globalVar/var';

interface IngressProps {
	setRefreshCluster: (flag: boolean) => void;
}

const Ingress = (props: IngressProps) => {
	const { setRefreshCluster } = props;
	const { id }: paramsProps = useParams();
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	useEffect(() => {
		let mounted = true;
		getIngresses({ clusterId: id }).then((res) => {
			if (res.success) {
				if (mounted) {
					setIngresses(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	const getData = () => {
		getIngresses({ clusterId: id }).then((res) => {
			if (res.success) {
				setIngresses(res.data);
				setRefreshCluster(true);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	return (
		<Page>
			<Content>
				<div className="flex-space-between">
					<div></div>
					<Button onClick={getData}>
						<Icon type="refresh" />
					</Button>
				</div>
				<div className="ingresses-content">
					<IngressCard
						status={-1}
						onRefresh={getData}
						clusterId={id}
						seconds={0}
						createTime={null}
					/>
					{ingresses.map((item, index) => {
						return (
							<IngressCard
								key={index}
								title={item.ingressClassName}
								status={item.status}
								createTime={item.createTime}
								seconds={item.seconds}
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
export default connect(() => ({}), {
	setRefreshCluster
})(Ingress);
