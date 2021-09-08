import React, { useState } from 'react';
import { CascaderSelect } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';

export default function SecondLayout(props: any): JSX.Element {
	const {
		title,
		subTitle,
		hasBackArrow = false,
		onBackArrowClick = () => window.history.back(),
		childrenAlign = 'right',
		style = {},
		className = '',
		children
	} = props;
	const [data, setData] = useState([]);
	const handleChange = (value: string | string[], data: any, extra: any) => {
		console.log(value, data, extra);
	};
	return (
		<Page>
			<Header
				title={title}
				subTitle={subTitle}
				hasBackArrow={hasBackArrow}
				onBackArrowClick={onBackArrowClick}
				childrenAlign={childrenAlign}
				className={className}
				style={style}
			>
				<CascaderSelect
					style={{ width: '333px' }}
					dataSource={data}
					onChange={handleChange}
				/>
			</Header>
			<Content>{children}</Content>
		</Page>
	);
}
