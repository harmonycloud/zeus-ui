import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@alicloud/console-components';
import Tag from './tag';
import './index.scss';

export interface listProps {
	name: string;
	count: number;
}
interface rapidProps {
	list: listProps[];
	selected: string;
	changeSelected: (value: string) => void;
}

export default function RapidScreening(props: rapidProps): JSX.Element {
	const { list, selected, changeSelected } = props;
	const [action, setAction] = useState<boolean>(true);
	const [showMore, setShowMore] = useState<boolean>(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const maxWidth = ref?.current?.clientWidth;
		maxWidth && maxWidth >= 952 ? setShowMore(true) : setShowMore(false);
	}, [list.length]);
	return (
		<div
			className="rapid-screening-content"
			style={{ flexDirection: action ? 'row' : 'column' }}
		>
			<div
				ref={ref}
				className={`rapid-screening-tags ${action ? '' : 'overflow'}`}
			>
				<div className="rapid-screening-title">快速筛选：</div>
				{list.map((item, index) => {
					return (
						<Tag
							key={index}
							data={item}
							flag={item.name === selected}
							changeSelected={changeSelected}
						/>
					);
				})}
			</div>
			{showMore && (
				<div
					className="rapid-screening-action"
					onClick={() => {
						if (ref.current) {
							ref.current.scrollTop = 0;
						}
						setAction(!action);
					}}
					style={{ marginTop: action ? 0 : 4 }}
				>
					{action ? '更多' : '收起'}
					<Icon
						type={action ? 'angle-double-down' : 'angle-double-up'}
						size="xs"
						style={{ marginLeft: 4 }}
					/>
				</div>
			)}
		</div>
	);
}
