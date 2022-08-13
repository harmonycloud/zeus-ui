import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router';
import {
	getZones,
	getZonesResource,
	updateZones
} from '@/services/activeActive';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { NoDataCard, ActiveDataCard } from './ActiveActiveCard';
import { ResourceZones, ZonesItem } from './activeActive';
import { Collapse, notification, Tabs } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './index.scss';
import NamespaceTable from './namespace';

const { Panel } = Collapse;
const { TabPane } = Tabs;
interface paramsProps {
	id: string;
	nickname: string;
}
export default function ActiveDetail(): JSX.Element {
	const params: paramsProps = useParams();
	const history = useHistory();
	const [panelVisible, setPanelVisible] = useState<boolean>(true);
	const [panel1Visible, setPanel1Visible] = useState<boolean>(true);
	const [zones, setZones] = useState<ZonesItem[]>([]);
	const [resourceZones, setResourceZones] = useState<ResourceZones>({
		zoneA: null,
		zoneB: null,
		zoneC: null
	});
	useEffect(() => {
		getData();
	}, []);
	useEffect(() => {
		if (zones) {
			const list: any[] = [];
			const obj: ResourceZones = {
				zoneA: null,
				zoneB: null,
				zoneC: null
			};
			zones.forEach((item: ZonesItem) => {
				getResourceZones(item.name)
					.then((res) => {
						obj[res.data.name] = res.data;
						list.push(res.data);
					})
					.finally(() => {
						if (list.length === zones.length) {
							list.sort((a: ZonesItem, b: ZonesItem) => {
								if (a.name === 'zoneA') {
									return -1;
								} else if (a.name === 'zoneB') {
									return 0;
								} else if (a.name === 'zoneC') {
									return 1;
								}
								return 0;
							});
							setResourceZones(obj);
						}
					});
			});
		}
	}, [zones]);
	const getData = () => {
		getZones({ clusterId: params.id }).then((res) => {
			if (res.success) {
				setZones(res.data);
			} else {
				setZones([]);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const getResourceZones = async (name: string) => {
		return await getZonesResource({
			clusterId: params.id,
			areaName: name
		});
	};
	const initArea = (data: ZonesItem) => {
		data.init
			? history.push(
					`/activeActive/active-detail/${params.id}/${params.nickname}/${data.name}/${data.aliasName}`
			  )
			: history.push(
					`/activeActive/active-active/${params.id}/${params.nickname}/${data.name}/${data.aliasName}`
			  );
	};
	const handleEdit = (value: any, name: string) => {
		if (value.aliasName.length > 20) {
			notification.error({
				message: '失败',
				description: '可用区名字不能超过20个字符！'
			});
			return;
		}
		if ((value.aliasName as string).trim() === '') {
			notification.error({
				message: '失败',
				description: '请填写可用区名字！'
			});
			return;
		}
		updateZones({
			clusterId: params.id,
			areaName: name,
			aliasName: value.aliasName
		})
			.then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '可用区名字修改成功！'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				getData();
			});
	};
	const genExtra = (record: number) => (
		<CloseOutlined
			onClick={(event) => {
				record === 0 ? setPanelVisible(false) : setPanel1Visible(false);
				// If you don't want click extra trigger collapse, you can prevent this:
				event.stopPropagation();
			}}
		/>
	);
	return (
		<ProPage>
			<ProHeader
				title={params.nickname}
				onBack={() => history.goBack()}
			/>
			<ProContent className="active-active-box">
				<Collapse className="site-collapse-custom-collapse">
					{panelVisible && (
						<Panel
							className="site-collapse-custom-panel"
							key="0"
							header="什么是同城双活？"
							extra={genExtra(0)}
						>
							同城双活是基于谐云的云原生产品的基础上，可以做到业务轻松实现跨数据中心同城双活，故障秒级切换，数据强一致性，同时业务零改造。
						</Panel>
					)}
					{panel1Visible && (
						<Panel
							className="site-collapse-custom-panel"
							key="1"
							header="什么是可用区？"
							extra={genExtra(1)}
						>
							可用区是指在同城双活场景下，中心概念的载体，通过可用区的划分来数据中心，实现跨数据中心同城双活。
						</Panel>
					)}
				</Collapse>
				<Tabs defaultActiveKey="1">
					<TabPane tab="可用区" key="1">
						<div
							className="display-flex"
							style={{ columnGap: 24, marginTop: 12 }}
						>
							{Object.keys(resourceZones).map((name: string) => {
								if (resourceZones[name]?.init === true) {
									return (
										<ActiveDataCard
											key={name}
											title={
												resourceZones[name].aliasName
											}
											onClick={initArea}
											handleEdit={handleEdit}
											data={resourceZones[name]}
										/>
									);
								}
								return (
									<NoDataCard
										key={name}
										title={resourceZones[name]?.aliasName}
										onClick={initArea}
										data={resourceZones[name]}
									/>
								);
							})}
						</div>
					</TabPane>
					<TabPane tab="命名空间" key="2">
						<NamespaceTable clusterId={params.id} />
					</TabPane>
				</Tabs>
			</ProContent>
		</ProPage>
	);
}
