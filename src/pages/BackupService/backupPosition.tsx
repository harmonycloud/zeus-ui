import React, { useState, useEffect } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Backup from '@/assets/images/backup.svg';
import { ListPanel, ListCardItem } from '@/components/ListCard';
import Actions from '@/components/Actions';
import { Select, Button, Tag, Input } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router';

const LinkButton = Actions.LinkButton;
const Search = Input.Search;
export default function BackupPosition(): JSX.Element {
	const [selectService, setSelectService] = useState<string>();
	const history = useHistory();

	return (
		<ProPage>
			<ProHeader
				title="备份位置"
				subTitle="发布中间件需要使用的备份位置"
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 48,
					style: { background: '#f5f5f5' }
				}}
			/>
			<ProContent>
				<div className="list-header">
					<div className="list-header-left">
						<Button
							type="primary"
							onClick={() =>
								history.push(
									'/backupService/backupPosition/addBackupPosition'
								)
							}
						>
							新增
						</Button>
						<Search />
					</div>
					<div className="list-header-right">
						<Button icon={<ReloadOutlined />}></Button>
					</div>
				</div>
				<ListPanel
					title="lvm存储"
					subTitle="CSI-Plugin"
					icon={
						<img
							src={Backup}
							style={{ marginLeft: 13, marginRight: 16 }}
						/>
					}
					actionRender={
						<Actions>
							<LinkButton>编辑</LinkButton>
							<LinkButton>删除</LinkButton>
						</Actions>
					}
					render={
						<>
							<Select
								style={{ width: 260 }}
								placeholder="请选择集群名称"
								value={selectService}
								onChange={(value) => setSelectService(value)}
							>
								<Select.Option key={1} valeu={1}>
									1
								</Select.Option>
								<Select.Option key={2} valeu={2}>
									2
								</Select.Option>
							</Select>
							<Button
								icon={<PlusOutlined />}
								style={{ marginLeft: 16 }}
								disabled={!selectService}
							></Button>
							<div style={{ marginTop: 16 }}>
								{['11111'].map((item: any) => {
									return (
										<Tag
											key={item.label}
											closable
											style={{ padding: '4px 10px' }}
											// onClose={}
										>
											{item}
										</Tag>
									);
								})}
							</div>
						</>
					}
				>
					<ListCardItem
						label="状态"
						value={
							<div>
								<span></span>正常
							</div>
						}
					/>
					<ListCardItem label="所属集群" value="140集群" />
					<ListCardItem label="存储容量" value="12.2GB/61.11GB" />
				</ListPanel>
			</ProContent>
		</ProPage>
	);
}
