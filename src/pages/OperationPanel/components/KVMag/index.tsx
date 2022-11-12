import React, { useEffect, useState } from 'react';
import { Input, Modal, notification, Button, Empty } from 'antd';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import RedisKeyItem from '../RedisKeyItem';
import {
	deleteRedisKey,
	getRedisKeys,
	getRedisValue
} from '@/services/operatorPanel';
import { ParamsProps, RedisKeyItem as RedisKeyItemParams } from '../../index.d';
import AddKey from './addKey';
import KVString from './KVString';
import KVHash from './KVHash';
import KVList from './KVList';
import KVSet from './KVSet';
import KVZset from './KVZSet';
import './index.scss';

const { confirm } = Modal;
interface KVMagProps {
	dbName: string;
}
export default function KVMag(props: KVMagProps): JSX.Element {
	const { dbName } = props;
	const params: ParamsProps = useParams();
	const [isAdd, setIsAdd] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [key, setKey] = useState<string>('');
	const [activeKey, setActiveKey] = useState<string>('');
	const [keys, setKeys] = useState<RedisKeyItemParams[]>([]);
	const [detail, setDetail] = useState<any>();
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
	useEffect(() => {
		getDetail();
	}, [key]);
	const getData = (keyword: string, key?: string) => {
		getRedisKeys({
			database: dbName,
			keyword: keyword,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				setKeys(res.data);
				key && getDetail();
				key ? setKey(key) : setKey(res.data[0]?.key);
			}
		});
	};
	const getDetail = () => {
		getRedisValue({
			database: dbName,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			key
		}).then((res) => {
			if (res.success) {
				setDetail(res.data);
			}
		});
	};
	const handleDelete = () => {
		confirm({
			title: '操作确认',
			content: '请确认是否删除该键值对',
			onOk: () => {
				deleteRedisKey({
					database: dbName,
					key,
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name
				}).then((res) => {
					if (res.success) {
						getData('');
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
	const handleAdd = () => setIsAdd(true);
	const handleEdit = () => console.log('edit');
	const handleView = () => console.log('view');
	const handleClick = (item: RedisKeyItemParams) => setKey(item.key);
	const childrenRender = (type: string) => {
		switch (type) {
			case 'hash':
				return (
					<KVHash
						data={detail}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData('', key)}
					/>
				);
				break;
			case 'zset':
				return (
					<KVZset
						data={detail}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData('', key)}
					/>
				);
				break;
			case 'list':
				return (
					<KVList
						data={detail}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData('', key)}
					/>
				);
				break;
			case 'set':
				return (
					<KVSet
						data={detail}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData('', key)}
					/>
				);
			case 'string':
				return (
					<KVString
						data={detail}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData('', key)}
					/>
				);
			default:
				return (
					<Empty
						description={false}
						style={{ margin: '150px 8px' }}
					/>
				);
		}
	};
	return (
		<>
			{!isAdd ? (
				<SplitPane {...paneProps}>
					{!isAdd ? (
						<div>
							<Button
								style={{ width: '100%' }}
								type="primary"
								onClick={() => setIsAdd(true)}
							>
								创建Key
							</Button>
							<Input.Search
								style={{ margin: '8px 0' }}
								placeholder="请输入关键字搜索"
								value={keyword}
								onChange={(e) => setKeyword(e.target.value)}
								onSearch={(value: string) =>
									handleSearch(value)
								}
							/>
							<div>
								{keys.map((item) => {
									return (
										<RedisKeyItem
											key={item.key}
											active={item.key === key}
											data={item}
											onDelete={handleDelete}
											onRefresh={handleRefresh}
											onAdd={handleAdd}
											onEdit={handleEdit}
											onView={handleView}
											onClick={() => handleClick(item)}
										/>
									);
								})}
							</div>
						</div>
					) : null}
					<div>{childrenRender(detail?.keyType)}</div>
				</SplitPane>
			) : (
				<AddKey
					onCancel={() => setIsAdd(false)}
					onRefresh={() => getData('')}
					database={dbName}
				/>
			)}
		</>
	);
}
