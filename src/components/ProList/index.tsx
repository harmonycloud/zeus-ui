import React from 'react';
import { Space, Input, Button } from 'antd';
import { ProListProps } from './proList';
import './index.scss';
import { ReloadOutlined } from '@ant-design/icons';
import DefaultPicture from '../DefaultPicture';

const { Search } = Input;
export default function ProList(props: ProListProps): JSX.Element {
	const {
		operation,
		showRefresh,
		onRefresh,
		search,
		refreshDisabled,
		children
	} = props;
	return (
		<div className="zeus-pro-list-content">
			<div className="zeus-pro-list-header">
				<div className="zeus-pro-list-left">
					<Space>
						{operation?.primary}
						{search && <Search allowClear {...search} />}
					</Space>
				</div>
				<div className="zeus-pro-list-right">
					<Space>
						{operation?.secondary}
						{showRefresh && (
							<Button
								disabled={refreshDisabled}
								type="default"
								icon={<ReloadOutlined />}
								onClick={onRefresh}
							/>
						)}
					</Space>
				</div>
			</div>
			<div className="zeus-pro-list-body">
				{children?.length > 0 ? (
					children
				) : (
					<DefaultPicture title="当前列表无数据" />
				)}
			</div>
		</div>
	);
}
