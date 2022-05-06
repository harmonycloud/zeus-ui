import React from 'react';
import { useHistory } from 'react-router';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { Button } from 'antd';
import FormBlock from '@/components/FormBlock';
import OtherResourcePoolImg from '@/assets/images/other-resource-pool.svg';
import { IconFont } from '@/components/IconFont';
import './index.scss';

export default function AddResourcePool(): JSX.Element {
	const history = useHistory();
	return (
		<ProPage>
			<ProHeader title="添加集群" onBack={() => window.history.back()} />
			<ProContent>
				<FormBlock title="纳管现有集群">
					<div
						className="resource-pool-content"
						onClick={() =>
							history.push(
								'/systemManagement/resourcePoolManagement/addResourcePool/addOther'
							)
						}
					>
						<img
							src={OtherResourcePoolImg}
							width={80}
							height={80}
						/>
						<div>基于已有集群</div>
						<IconFont type="icon-xuanzhong" />
					</div>
				</FormBlock>
				<Button type="primary" onClick={() => window.history.back()}>
					返回
				</Button>
			</ProContent>
		</ProPage>
	);
}
