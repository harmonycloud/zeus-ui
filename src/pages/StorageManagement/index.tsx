import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import storageIcon from '@/assets/images/storage-manage.svg';
import React from 'react';
import { ListCard, ListCardItem } from '@/components/ListCard';
import Actions from '@/components/Actions';

const LinkButton = Actions.LinkButton;
export default function StorageManagement(): JSX.Element {
	return (
		<ProPage>
			<ProHeader title="存储管理" subTitle="发布中间件需要使用的存储" />
			<ProContent>
				<ListCard
					title="lvm存储"
					subTitle="CSI-Plugin"
					icon={
						<img
							src={storageIcon}
							style={{ marginLeft: 13, marginRight: 16 }}
						/>
					}
					actionRender={
						<Actions>
							<LinkButton>编辑</LinkButton>
							<LinkButton>删除</LinkButton>
						</Actions>
					}
				>
					<ListCardItem label="状态" value="正常" />
					<ListCardItem label="所属集群" value="140集群" />
					<ListCardItem label="存储容量" value="12.2GB/61.11GB" />
				</ListCard>
			</ProContent>
		</ProPage>
	);
}
