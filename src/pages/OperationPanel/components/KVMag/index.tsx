import React, { useEffect, useState } from 'react';
import { Input, Modal, notification, Button } from 'antd';
import { useParams } from 'react-router';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import RedisKeyItem from '../RedisKeyItem';
import { deleteRedisKey, getRedisKeys } from '@/services/operatorPanel';
import { ParamsProps, RedisKeyItem as RedisKeyItemParams } from '../../index.d';
import AddKV from './addKV';
import KVString from './KVString';
import KVHash from './KVHash';

const { confirm } = Modal;
interface KVMagProps {
	dbName: string;
}
// TODO k-v 关键词搜索
export default function KVMag(props: KVMagProps): JSX.Element {
	const { dbName } = props;
	const params: ParamsProps = useParams();
	const [isAdd, setIsAdd] = useState<boolean>(false);
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
			database: dbName,
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
	// TODO 添加 k-v
	const handleAdd = () => setIsAdd(true);
	// TODO 编辑 k-v
	const handleEdit = () => console.log('edit');
	// TODO 查看 k-v
	const handleView = () => console.log('view');
	// TODO 查看，编辑页面render （每个类型一个component）
	const childrenRender = (type: string) => {
		switch (type) {
			case 'hash':
				return <KVHash />;
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
								创建k-v
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
							{/* TODO 循环 */}
							<RedisKeyItem
								onDelete={handleDelete}
								onRefresh={handleRefresh}
								onAdd={handleAdd}
								onEdit={handleEdit}
								onView={handleView}
							/>
						</div>
					) : null}
					<div>{childrenRender('string')}</div>
				</SplitPane>
			) : (
				<AddKV onCancel={() => setIsAdd(false)} />
			)}
		</>
	);
}
