import React, { useEffect, useState } from 'react';
import { Input, Modal, notification } from 'antd';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import RedisKeyItem from '../RedisKeyItem';
import { deleteRedisKey, getRedisKeys } from '@/services/operatorPanel';
import { ParamsProps, RedisKeyItem as RedisKeyItemParams } from '../../index.d';
import { childrenRender } from '@/utils/utils';
import KVString from './KVString';

const { confirm } = Modal;
export default function KVMag(): JSX.Element {
	const params: ParamsProps = useParams();
	const [keyword, setKeyword] = useState<string>('');
	const [key, setKey] = useState<RedisKeyItemParams>();
	const [keys, setKeys] = useState<RedisKeyItemParams[]>([]);
	const [paneProps] = useState<SplitPaneProps>({
		split: 'vertical',
		minSize: 200,
		style: {
			height: '100%',
			width: '100%'
		},
		pane1Style: {
			overflow: 'auto',
			paddingRight: 8
		},
		pane2Style: {
			width: 'calc(100% - 200px)',
			overflow: 'auto',
			padding: 8
		}
	});
	useEffect(() => {
		getData('');
	}, []);
	const getData = (keyword: string) => {
		getRedisKeys({
			database: '',
			keyword: keyword,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				setKeys(res.data);
			}
		});
	};
	const handleDelete = () => {
		confirm({
			title: '操作确认',
			content: '请确认是否删除该键值对',
			onOk: () => {
				deleteRedisKey({
					database: '',
					key: '',
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '键值对删除成功'
						});
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	const handleRefresh = () => {
		console.log('refresh');
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
		getData(value);
	};
	const handleAdd = () => console.log('add');
	const handleEdit = () => console.log('edit');
	const handleView = () => console.log('view');
	const childrenRender = (type: string) => {
		switch (type) {
			case 'hash':
				break;
			case 'Zset':
				break;
			case 'list':
				break;
			case 'set':
				return <KVString />;
			case 'string':
				return <KVString />;
			default:
				break;
		}
	};
	return (
		<SplitPane {...paneProps}>
			<div>
				<Input.Search
					style={{ marginBottom: 8 }}
					placeholder="请输入关键字搜索"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					onSearch={(value: string) => handleSearch(value)}
				/>
				<RedisKeyItem
					onDelete={handleDelete}
					onRefresh={handleRefresh}
					onAdd={handleAdd}
					onEdit={handleEdit}
					onView={handleView}
				/>
			</div>
			<div>{childrenRender('string')}</div>
		</SplitPane>
	);
}
