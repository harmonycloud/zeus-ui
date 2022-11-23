import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import SecondLayout from '@/components/SecondLayout';
import Log from '@/pages/ServiceListDetail/Log';
import NoService from '@/components/NoService';

import { getMiddlewareDetail } from '@/services/middleware';
import { middlewareDetailProps, basicDataProps } from '@/types/comment';
import { clusterType, StoreState } from '@/types';
import { connect } from 'react-redux';
import { ProjectItem } from '../ProjectManage/project';
import { getComponents } from '@/services/common';

interface LogDetailProps {
	project: ProjectItem;
}
function LogDetail(props: LogDetailProps): JSX.Element {
	const [data, setData] = useState<middlewareDetailProps>();
	const [basicData, setBasicData] = useState<basicDataProps>();
	const [isService, setIsService] = useState<boolean>(false);
	const [loggingOpen, setLoggingOpen] = useState<boolean>(false);
	useEffect(() => {
		if (basicData) {
			getComponents({ clusterId: basicData?.clusterId }).then((res) => {
				if (res.success) {
					const loggingTemp = res.data.find(
						(item: any) => item.component === 'logging'
					).status;
					switch (loggingTemp) {
						case 1:
							setLoggingOpen(true);
							break;
						case 3:
							setLoggingOpen(true);
							break;
						case 4:
							setLoggingOpen(true);
							break;
						default:
							setLoggingOpen(false);
							break;
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [basicData]);
	const onChange = (
		name: string | null,
		type: string,
		namespace: string,
		cluster: clusterType
	) => {
		if (name !== null) {
			setBasicData({
				name,
				type,
				clusterId: cluster.id,
				namespace
			});
			getMiddlewareDetail({
				clusterId: cluster.id,
				namespace,
				type,
				middlewareName: name
			}).then((res) => {
				if (res.success) {
					setIsService(true);
					setData(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		} else {
			setIsService(false);
		}
	};
	const getData = () => {
		getMiddlewareDetail({
			clusterId: basicData?.clusterId,
			namespace: basicData?.namespace,
			type: basicData?.type,
			middlewareName: basicData?.name
		}).then((res) => {
			if (res.success) {
				setIsService(true);
				setData(res.data);
			} else {
				setIsService(false);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<SecondLayout
			title="日志详情"
			subTitle="用于中间件服务的日志查询"
			hasBackArrow={true}
			onChange={onChange}
		>
			{isService && data && JSON.stringify(data) !== '{}' && (
				<Log
					type={basicData?.type as string}
					data={data}
					middlewareName={basicData?.name as string}
					clusterId={basicData?.clusterId as string}
					namespace={basicData?.namespace as string}
					customMid={data?.dynamicValues !== null}
					capabilities={data?.capabilities || []}
					logging={loggingOpen}
					onRefresh={getData}
				/>
			)}
			{!isService && <NoService />}
		</SecondLayout>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(LogDetail);
