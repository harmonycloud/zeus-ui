import React from 'react';
import { useHistory } from 'react-router';
import { Page, Content, Header } from '@alicloud/console-components-page';
import FormBlock from '@/components/FormBlock';
import OtherResourcePoolImg from '@/assets/images/other-resource-pool.svg';
import CustomIcon from '@/components/CustomIcon';
import './index.scss';
import { Button } from '@alicloud/console-components';

export default function AddResourcePool(): JSX.Element {
	const history = useHistory();
	return (
		<Page>
			<Header
				title="添加集群"
				hasBackArrow={true}
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
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
						<CustomIcon type="icon-xuanzhong" />
					</div>
				</FormBlock>
				<Button type="primary" onClick={() => window.history.back()}>
					返回
				</Button>
			</Content>
		</Page>
	);
}
