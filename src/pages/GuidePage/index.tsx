import React, { useEffect, useState } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { notification } from 'antd';

import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import step1 from '@/assets/images/step1.svg';
import step2 from '@/assets/images/step2.svg';
import step3 from '@/assets/images/step3.svg';
import { getClusters, getComponents } from '@/services/common';
import { getProjects } from '@/services/project';
import { StoreState, globalVarProps } from '@/types/index';
import { ComponentProp } from '@/pages/ResourcePoolManagement/resource.pool';

import './index.scss';
import storage from '@/utils/storage';
interface GuideProps {
	globalVar: globalVarProps;
}
const GuidePage = (props: GuideProps) => {
	const [current, setCurrent] = useState<string>('1');
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const {
		cluster,
		clusterList: globalClusterList,
		project
	} = props.globalVar;
	const history = useHistory();
	useEffect(() => {
		setIsAdmin(
			JSON.parse(storage.getLocal('role')).userRoleList.some(
				(i: any) => i.roleId === 1
			)
		);
	}, [JSON.parse(storage.getLocal('role'))]);
	useEffect(() => {
		getClusters({ detail: true })
			.then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						setCurrent('2');
					} else {
						setCurrent('1');
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				getProjects({ key: '' }).then((res) => {
					if (res.success) {
						if (res.data.length > 0) {
							if (JSON.stringify(project) !== '{}') {
								getClusters({
									detail: true,
									projectId: project.projectId
								}).then((res) => {
									if (res.success) {
										if (res.data.length > 0) {
											setCurrent('3');
										} else {
											setCurrent('2');
										}
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
								});
							} else {
								setCurrent('2');
							}
						} else {
							setCurrent('2');
						}
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
						setCurrent('2');
					}
				});
			})
			.finally(() => {
				if (JSON.stringify(cluster) !== '{}') {
					getComponents({
						clusterId: cluster.id
					}).then((res) => {
						if (res.success) {
							const middlewareControllerStatus = res.data.find(
								(item: ComponentProp) =>
									item.component === 'middleware-controller'
							).status;
							if (middlewareControllerStatus === 3) {
								setCurrent('3');
							} else {
								setCurrent('3');
							}
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
							setCurrent('3');
						}
					});
				}
			});
	}, [props]);
	return (
		<ProPage>
			{console.log(current)}
			<ProHeader title="初始化操作引导" />
			<ProContent>
				<div className="guide-page-content">
					<div className="guide-page-img-content">
						<div className="guide-page-img-item">
							<img src={step2} width={200} height={200} />
							<div className="guide-page-img-title">
								<div
									className="guide-page-img-icon"
									style={
										current === '1' ||
										current === '2' ||
										current === '3'
											? {
													backgroundColor: '#0064C8',
													border: '1px solid #0064C8',
													color: '#fff'
											  }
											: {}
									}
								>
									1
								</div>
								<div className="guide-page-img-info">
									添加集群
								</div>
								<div
									className="guide-page-line"
									style={
										current === '1' ||
										current === '2' ||
										current === '3'
											? {
													borderBottom:
														'1px solid #0064C8'
											  }
											: {}
									}
								></div>
							</div>
							<div className="guide-page-desc">
								添加集群用以发布中间件。
								{isAdmin && (
									<span
										className={
											current === '1' ||
											current === '2' ||
											current === '3'
												? 'name-link'
												: 'name-disabled-link'
										}
										onClick={() => {
											if (
												current === '1' ||
												current === '2' ||
												current === '3'
											) {
												history.push(
													'/systemManagement/resourcePoolManagement/addResourcePool/addOther'
												);
											}
										}}
									>
										立即前往
									</span>
								)}
							</div>
						</div>
						<div className="guide-page-img-item">
							<img src={step1} width={200} height={200} />
							<div className="guide-page-img-title">
								<div
									className="guide-page-img-icon"
									style={
										current === '3'
											? {
													backgroundColor: '#0064C8',
													border: '1px solid #0064C8',
													color: '#fff'
											  }
											: {}
									}
								>
									2
								</div>
								<div className="guide-page-img-info">
									创建项目并绑定资源
								</div>
								<div
									className="guide-page-line-2"
									style={
										current === '2' || current === '3'
											? {
													borderBottom:
														'1px solid #0064C8'
											  }
											: {}
									}
								></div>
							</div>
							<div className="guide-page-desc">
								业务范围以项目区分，通过项目管理中间件。
								{isAdmin && (
									<span
										className="name-link"
										onClick={() => {
											if (
												current === '2' ||
												current === '3'
											) {
												history.push(
													'/systemManagement/projectManagement'
												);
											}
										}}
									>
										立即前往
									</span>
								)}
							</div>
						</div>
						<div className="guide-page-img-item">
							<img src={step3} width={200} height={200} />
							<div className="guide-page-img-title">
								<div
									className="guide-page-img-icon"
									style={
										current === '3'
											? {
													backgroundColor: '#0064C8',
													border: '1px solid #0064C8',
													color: '#fff'
											  }
											: {}
									}
								>
									3
								</div>
								<div className="guide-page-img-info">
									安装或接入集群组件及中间件
								</div>
							</div>
							<div className="guide-page-desc">
								平台运行需要依赖各类组件，并且上架默认推荐版本中间件，便可以发布中间服务。
								{isAdmin && (
									<span
										className={
											current === '3'
												? 'name-link'
												: 'name-disabled-link'
										}
										onClick={() => {
											if (current === '3') {
												history.push(
													`/systemManagement/resourcePoolManagement/resourcePoolDetail/${cluster.id}/${cluster.nickname}`
												);
											}
										}}
									>
										立即前往
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</ProContent>
		</ProPage>
	);
};
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(GuidePage);
