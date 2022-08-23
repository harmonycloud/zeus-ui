import React, { useState } from 'react';
import { Form, Modal, Button, notification, Upload } from 'antd';

import { api } from '@/api.json';
import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { StoreState } from '@/types/index';

import { UploadMiddlewareFormProps } from './upload';

const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 14
	}
};

function UploadMiddlewareForm(props: UploadMiddlewareFormProps) {
	const { visible, onCancel, onCreate } = props;
	const { cluster: globalCluster } = props.globalVar;
	const [fileList, setFileList] = useState<any[]>([]);
	const [form] = Form.useForm();
	const headers = {
		userToken: storage.getLocal('token'),
		authType: storage.getLocal('token') ? '1' : '0'
	};

	function beforeUpload(file: any) {
		setFileList([file]);
		return false;
	}

	const handleUpload = () => {
		const formData = new FormData();
		fileList.forEach((file) => {
			formData.append('file', file);
		});
		fetch(`${api}/clusters/${globalCluster.id}/middlewares/upload`, {
			method: 'POST',
			body: formData,
			headers
		}).then((res) => {
			if (res.ok) {
				setFileList([]);
				notification.success({
					message: '成功',
					description: 'chart包上传成功，3秒后刷新数据'
				});
				onCreate();
			} else {
				Modal.error({
					title: '失败',
					content: '上架失败，不可上传旧版本或者已有版本'
				});
			}
		});
	};

	const onRemove = () => {
		setFileList([]);
	};

	const onOk = () => {
		handleUpload();
	};

	return (
		<Modal
			visible={visible}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
			onCancel={onCancel}
			title="中间件上架"
			style={{ width: 450 }}
		>
			<Form {...formItemLayout} form={form}>
				<Form.Item
					label="上传包"
					rules={[{ required: true, message: '请上传chart包' }]}
					name="file"
				>
					<Upload
						beforeUpload={beforeUpload}
						onRemove={onRemove}
						fileList={fileList}
						maxCount={1}
					>
						{!fileList.length ? (
							<Button
								type="primary"
								style={{ margin: '0 0 10px' }}
							>
								上传文件
							</Button>
						) : null}
					</Upload>
				</Form.Item>
			</Form>
		</Modal>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(UploadMiddlewareForm);
