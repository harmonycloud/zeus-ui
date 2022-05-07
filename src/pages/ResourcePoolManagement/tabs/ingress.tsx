import React, { useEffect, useState } from 'react';
import { Button, notification } from 'antd';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { ReloadOutlined } from '@ant-design/icons';
import IngressCard from '@/components/IngressCard';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { IngressItemProps } from '../resource.pool';
import { getIngresses } from '@/services/common';
import { paramsProps } from '../detail';

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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	return (
		<>
			<div className="flex-space-between">
				<div></div>
				<Button onClick={getData} icon={<ReloadOutlined />} />
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
		</>
	);
};
export default connect(() => ({}), {
	setRefreshCluster
})(Ingress);
