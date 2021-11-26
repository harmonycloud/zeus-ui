import React, { useEffect, useState } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import { paramsProps } from '../detail';
import { getIngresses } from '@/services/common';
import { Message } from '@alifd/next';
import messageConfig from '@/components/messageConfig';
import MidCard from '@/components/MidCard';

const Ingress = () => {
	const { id }: paramsProps = useParams();
	const [ingresses, setIngresses] = useState([]);
	const [installVisible, setInstallVisible] = useState<boolean>(false);
	const [accessVisible, setAccessVisible] = useState<boolean>(false);
	// useEffect(() => {
	// 	getIngresses({ clusterId: id }).then((res) => {
	// 		if (res.success) {
	// 			setIngresses(res.data);
	// 		} else {
	// 			Message.show(messageConfig('error', '失败', res));
	// 		}
	// 	});
	// }, []);
	return (
		<Page>
			<Content>
				<div className="ingresses-content">
					<MidCard
						leftText="安装"
						rightText="接入"
						actionCount={2}
						leftHandle={() => setInstallVisible(true)}
						rightHandle={() => setAccessVisible(true)}
						status={-1}
						addTitle="新增负载均衡"
					/>
					{/* <MidCard
						leftText="安装"
						rightText="接入"
						actionCount={2}
						leftHandle={() => setInstallVisible(true)}
						rightHandle={() => setAccessVisible(true)}
						icon="icon-fuzaijunheng"
						color="#FFAA3A"
						title="负载均衡名称"
						status={1}
					/> */}
					{/* {ingresses.map((item, index) => {
						return (
							<MidCard
								key={index}

							/>
						)
					})} */}
				</div>
			</Content>
		</Page>
	);
};
export default Ingress;
