import React from 'react';
import ProList from '@/components/ProList';
import { Button } from 'antd';
import { ListCard, ListCardItem } from '@/components/ListCard';

export default function ServiceDetailIngress(): JSX.Element {
	const Operation = {
		primary: <Button type="primary">新增</Button>
	};
	return (
		<ProList operation={Operation}>
			<ListCard title="MySQL-test" subTitle="MySQL" icon={undefined}>
				<ListCardItem label="暴露方式" value="TCP" />
			</ListCard>
			<ListCard title="MySQL-test" subTitle="MySQL" icon={undefined}>
				<ListCardItem label="暴露方式" value="TCP" />
			</ListCard>
		</ProList>
	);
}
