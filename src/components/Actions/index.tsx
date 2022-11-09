import React, { ReactElement, useEffect, useState } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { ActionsProps, LinkButtonProps } from './actions';
import { Dropdown, Menu } from 'antd';
import './index.scss';
import { log } from 'console';

const Actions = (props: ActionsProps) => {
	const { children, threshold = 3 } = props;
	const [list, setList] = useState<React.ReactNode[]>([]);
	useEffect(() => {
		if (children) {
			if (children instanceof Array) {
				setList(children);
			} else {
				setList([children]);
			}
		}
	}, [children]);
	if (list.length <= threshold) {
		return (
			<div className="zeus-actions-content">
				{list.map(
					(item: React.ReactNode | boolean | null, index: number) => {
						if (item !== null && typeof item !== 'boolean') {
							return (
								<LinkButton
									style={{
										marginRight: 8,
										marginLeft: 8
									}}
									key={index}
									onClick={
										(item as ReactElement).props?.onClick
									}
									disabled={
										(item as ReactElement).props
											?.disabled || false
									}
									{...(item as ReactElement).props}
								>
									{(item as ReactElement).props.children}
								</LinkButton>
							);
						}
					}
				)}
			</div>
		);
	} else {
		const l1 = list.slice(0, threshold);
		const l2 = list.slice(threshold);
		const menu = l2.map((item: React.ReactNode, index: number) => {
			return {
				label: (
					<span onClick={(item as ReactElement).props?.onClick}>
						{(item as ReactElement).props.children}
					</span>
				),
				key: index
			};
		});
		return (
			<div className="zeus-actions-content">
				{l1.map((item: React.ReactNode, index: number) => {
					if (item !== null && typeof item !== 'boolean') {
						return (
							<LinkButton
								style={{ marginRight: 8, marginLeft: 8 }}
								key={index}
								onClick={(item as ReactElement).props?.onClick}
								disabled={
									(item as ReactElement).props?.disabled ||
									false
								}
								{...(item as ReactElement).props}
							>
								{(item as ReactElement).props?.children}
							</LinkButton>
						);
					}
				})}
				<Dropdown trigger={['click']} overlay={<Menu items={menu} />}>
					<MoreOutlined
						style={{
							fontSize: 14,
							marginLeft: 4,
							cursor: 'pointer'
						}}
					/>
				</Dropdown>
			</div>
		);
	}
};
const LinkButton = (props: LinkButtonProps) => {
	const { disabled = false, children, onClick, style, ...args } = props;
	return (
		<span
			style={style}
			className={disabled ? 'displayed-name' : 'name-link'}
			onClick={disabled ? undefined : onClick}
			{...args}
		>
			{children}
		</span>
	);
};

Actions.LinkButton = LinkButton;
export default Actions;
