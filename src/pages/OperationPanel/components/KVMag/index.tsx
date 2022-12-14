import React, { useEffect, useState } from 'react';
import { Input, Modal, notification, Button, Empty, Pagination } from 'antd';
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
	redisDbRefresh: () => void;
}
export default function KVMag(props: KVMagProps): JSX.Element {
	const { dbName, redisDbRefresh } = props;
	const params: ParamsProps = useParams();
	const [isAdd, setIsAdd] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [key, setKey] = useState<string>('');
	const [activeKey, setActiveKey] = useState<string>('');
	const [keys, setKeys] = useState<any>([]);
	const [detail, setDetail] = useState<any>();
	const [cursor, setCursor] = useState<number>(0);
	const [preCursor, setPreCursor] = useState<number>(0);
	const [count, setCount] = useState<number>(10);
	const [pod, setPod] = useState<string>('');
	const [prePod, setPrePod] = useState<string>('');
	const [total, setTotal] = useState<number>(0);
	const [current, setCurrent] = useState<number>(1);

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
		getData();
	}, []);
	useEffect(() => {
		getDetail();
	}, [key]);
	const paginationChange = (page: number, pageSize: number) => {
		setCurrent(page);
		setCount(pageSize);
		const alertData = {
			cursor: page > current ? preCursor : cursor,
			count: pageSize,
			pod: page > current ? prePod : pod
		};
		getData('', alertData);
	};
	const getData = (keyword?: string, pageOptions?: any) => {
		getRedisKeys({
			database: dbName,
			keyword: keyword || '',
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			cursor: pageOptions?.cursor || 0,
			count: pageOptions?.count || 10,
			pod: pageOptions?.pod || ''
		}).then((res: any) => {
			if (res.success) {
				setKeys(res.data.keys);
				setKey(res.data.keys[0]);
				setCursor(res.data.cursor);
				setPreCursor(res.data.preCursor);
				setPod(res.data.pod);
				setPrePod(res.data.cursor);
				setTotal(res.data.sum);
				// key && getDetail();
				// key ? setKey(key) : setKey(res.data[0]?.key);
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
						getData();
						redisDbRefresh();
						notification.success({
							message: '成功',
							description: '键值对删除成功'
						});
					} else {
						notification.error({
							message: '失败',
							description: (
								<>
									<p>{res.errorMsg}</p>
									<p>{res.errorDetail}</p>
								</>
							)
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
	const handleClick = (item: string) => setKey(item);
	const childrenRender = (type: string) => {
		switch (type) {
			case 'hash':
				return (
					<KVHash
						data={detail}
						currentKey={key}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData()}
					/>
				);
				break;
			case 'zset':
				return (
					<KVZset
						data={detail}
						currentKey={key}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData()}
					/>
				);
				break;
			case 'list':
				return (
					<KVList
						data={detail}
						currentKey={key}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData()}
					/>
				);
				break;
			case 'set':
				return (
					<KVSet
						data={detail}
						currentKey={key}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData()}
					/>
				);
			case 'string':
				return (
					<KVString
						data={detail}
						currentKey={key}
						database={dbName}
						onRefresh={getDetail}
						getKeys={(key: string) => getData()}
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
						<div style={{ height: '100%' }}>
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
							<div style={{ height: 'calc(100% - 105px)' }}>
								{keys.map((item: any) => {
									return (
										<RedisKeyItem
											key={item}
											active={item === key}
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
							{console.log(total)}
							<Pagination
								total={total}
								current={current}
								simple
								size="small"
								pageSize={count}
								className="no-page"
								showTotal={() => <span>共{total}条</span>}
								style={{ float: 'right' }}
								onChange={paginationChange}
							/>
						</div>
					) : null}
					<div>{childrenRender(detail?.keyType)}</div>
				</SplitPane>
			) : (
				<AddKey
					onCancel={() => setIsAdd(false)}
					onRefresh={() => {
						redisDbRefresh();
						getData();
					}}
					database={dbName}
				/>
			)}
		</>
	);
}
