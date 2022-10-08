import React, { useEffect, useState } from 'react';
import MidProcess from '@/components/MidProcess';
import { getClusterCpuAndMemory } from '@/services/common';
import LineLoading from '@/components/LineLoading';
interface MemoryItemProps {
	clusterId: string;
	type: string;
	isRefresh: boolean;
}
export default function MemoryItem(props: MemoryItemProps): JSX.Element {
	const { clusterId, type, isRefresh } = props;
	const [per, setPer] = useState<number | null>(null);
	const [used, setUsed] = useState<number | null>(null);
	const [total, setTotal] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		console.log(isRefresh);
		if (clusterId && type) {
			setLoading(true);
			getClusterCpuAndMemory({ clusterId: clusterId })
				.then((res) => {
					console.log(res);
					const perCpu = res.data
						? (Number(res.data?.usedCpu) /
								Number(res.data?.totalCpu)) *
						  100
						: 0;
					const perMem = res.data
						? (Number(res.data?.usedMemory) /
								Number(res.data?.totalMemory)) *
						  100
						: 0;
					if (res.success) {
						setLoading(false);
						if (res.data) {
							setTotal(
								type === 'memory'
									? res.data.totalMemory
									: res.data.totalCpu
							);
							setUsed(
								type === 'memory'
									? res.data.usedMemory
									: res.data.usedCpu
							);
							setPer(type === 'memory' ? perMem : perCpu);
						}
					}
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [isRefresh]);
	if (loading) {
		return (
			<LineLoading
				color={
					type === 'memory'
						? 'rgb(248, 163, 89)'
						: 'rgb(127, 177, 255)'
				}
			/>
		);
	} else {
		return (
			<MidProcess
				per={per || 0}
				used={used}
				total={total}
				right={
					type === 'memory'
						? 'rgb(248, 163, 89)'
						: 'rgb(127, 177, 255)'
				}
				bottom={
					type === 'memory'
						? 'rgb(252, 201, 116)'
						: 'rgb(122, 212, 255)'
				}
				color={
					type === 'memory'
						? 'rgb(248, 163, 89)'
						: 'rgb(127, 177, 255)'
				}
			/>
		);
	}
}
