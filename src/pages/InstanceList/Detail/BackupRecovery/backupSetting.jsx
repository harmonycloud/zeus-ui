import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	NumberPicker,
	Checkbox,
	TimePicker,
	Message
} from '@alicloud/console-components';
import Visualization from '../HighAvailability/visualization';
import moment from 'moment';
import { connect, useStore } from 'react-redux';
import messageConfig from '@/components/messageConfig';
import storage from '@/utils/storage';
import { addBackupConfig, backupNow, updateBackupConfig } from '@/services/backup';
import { Page, Content } from '@alicloud/console-components-page';
import { getPods } from '@/services/middleware';
import { useHistory } from 'react-router';
import { Button } from '@alifd/next';

const formItemLayout = {
	labelCol: {
		span: 2
	},
	wrapperCol: {
		span: 14
	}
};
const list = [
	{ value: 1, label: '星期一' },
	{ value: 2, label: '星期二' },
	{ value: 3, label: '星期三' },
	{ value: 4, label: '星期四' },
	{ value: 5, label: '星期五' },
	{ value: 6, label: '星期六' },
	{ value: 0, label: '星期日' }
];
const listMap = {
	星期一: 1,
	星期二: 2,
	星期三: 3,
	星期四: 4,
	星期五: 5,
	星期六: 6,
	星期日: 0
};
const { Group: CheckboxGroup } = Checkbox;
function BackupSetting(props) {
	const field = Field.useField();
	const { clusterId, namespace, data: listData, isEdit, record, backup } = storage.getSession('detail');
	const [topoData, setTopoData] = useState();
	const [backupData, setBackupData] = useState({
		configed: false,
		limitRecord: 0,
		cycle: '',
		time: '',
		nextBackupTime: '',
		pause: 'on',
		canPause: true
	});
	const history = useHistory();
	const [backupObj, setBackupObj] = useState();

	const onOk = () => {
		field.validate((error, values) => {
			if (!error) {
				onCreate(values);
			}
		});
	};
	useEffect(() => {
		// if (data.pause === 'off') {
		// 	const arr = data.time.split(':');
		// 	const obj = {
		// 		hour: arr[0],
		// 		minute: arr[1]
		// 	};
		// 	field.setValues({
		// 		count: data.limitRecord,
		// 		cycle: data.cycle.split(',').map((item) => listMap[item]),
		// 		time: moment(obj)
		// 	});
		// }
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: listData.name,
			type: listData.type
		};
		getPodList(sendData);
		record &&
			field.setValues({
				count: record.limitRecord,
				cycle: record.cron
					.split(' ? ? ')[1]
					.split(',')
					.map((item) => Number(item)),
				time: record.cron
					.split(' ? ? ')[0]
					.split(' ')
					.reverse()
					.map((item) => (item.length === 1 ? '0' + item : item))
					.join(':')
			});
	}, []);

	useEffect(() => {
		return () => {
			storage.removeSession('detail');
		};
	}, []);

	// * 获取pod列表
	const getPodList = (sendData) => {
		getPods(sendData).then((res) => {
			if (res.success) {
				setTopoData(res.data.podInfoGroup);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const onCreate = (values) => {
		const minute = moment(values.time).get('minute');
		const hour = moment(values.time).get('hour');
		const week = values.cycle.join(',');
		const cron = `${minute} ${hour} ? ? ${week}`;

		if (!backupObj) {
			Message.show(messageConfig('warning', '提示', '请选择实例对象'));
			return;
		}
		if (!isEdit) {
			const sendData = {
				clusterId,
				namespace,
				middlewareName: listData.name,
				type: listData.type,
				limitRecord: values.count,
				cron: (typeof values.time !== 'string') ? cron : `${values.time.substring(3, 5)} ${values.time.substring(0, 2)} ? ? ${week}`
			};
			if (backupObj !== 'serve') sendData.pod = backupObj;
			addBackupConfig(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '备份设置成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					// getData();
				});
		} else {
			if (record) {
				const sendData = {
					clusterId,
					namespace,
					backupScheduleName: record.backupScheduleName,
					type: listData.type,
					limitRecord: values.count,
					cron: (typeof values.time !== 'string') ? cron : `${values.time.substring(3, 5)} ${values.time.substring(0, 2)} ? ? ${week}`
				};
				updateBackupConfig(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '备份设置成功')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						// getData();
					});
			} else {
				const sendData = {
					clusterId,
					namespace,
					backupName: backup.backupName,
					type: listData.type,
					middlewareName: listData.name,
					backupFileName: backup.backupFileName,
				};
				if (backupObj !== 'serve'){
					sendData.pod = backupObj;
				}else{
					sendData.pod = listData.pods.map(item => item.podName);
				}
				backupNow(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '备份恢复成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					// getData();
				});
			}
		}
	};

	return (
		<Page>
			<Content>
				{topoData && (
					<Visualization
						serverData={listData}
						topoData={topoData}
						backupObj={backupObj}
						setBackupObj={(value) => setBackupObj(value)}
						isEdit={isEdit}
					/>
				)}
				{
					!isEdit || record ? <Form {...formItemLayout} field={field} style={{ marginTop: '24px' }}>
						<Form.Item
							label="备份保留个数"
							required
							requiredMessage="备份保留个数不能为空"
							min={1}
							minmaxLengthMessage="备份保留个数最小值为1"
						>
							<NumberPicker
								min={1}
								defaultValue={1}
								type="inline"
								name="count"
							/>
						</Form.Item>
						<Form.Item
							label="备份周期"
							required
							requiredMessage="备份周期不能为空！"
						>
							<CheckboxGroup name="cycle" dataSource={list} />
						</Form.Item>
						<Form.Item
							label="备份时间"
							required
							requiredMessage="备份时间不能为空"
						>
							<TimePicker
								name="time"
								minuteStep={30}
								format="HH:mm"
							/>
						</Form.Item>
					</Form> : null
				}
				{
					!isEdit || record ? <div style={{ padding: '16px 9px', boxShadow: '0px -1px 0px 0px #E3E4E6' }}>
						<Button onClick={onOk} type="primary" style={{ marginRight: '9px' }}>确定</Button>
						<Button>取消</Button>
					</div> :
						<div style={{ padding: '16px 9px' }}>
							{listData.type === 'mysql' && <Button onClick={() => history.push('/serviceList/mysqlCreate/MySQL/mysql/'+listData.chartVersion)} type="primary" style={{ marginRight: '9px' }}>克隆</Button>}
							<Button onClick={onOk} type="primary" style={{ marginRight: '9px' }}>覆盖</Button>
							<Button>取消</Button>
						</div>
				}
			</Content>
		</Page>
	);
}
export default connect(({ globalVar }) => ({ globalVar }), {})(BackupSetting);
