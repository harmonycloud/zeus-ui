import React, { createRef } from 'react';
import {
	Field,
	Form,
	Dialog,
	Upload,
	Button,
	Message
} from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import { api } from '@/api.json';
import { connect } from 'react-redux';
import storage from '@/utils/storage';

const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 14
	}
};

function UploadMiddlewareForm(props) {
	const { visible, onCancel, onCreate } = props;
	const { cluster: globalCluster } = props.globalVar;
	const upload2 = createRef();
	const field = Field.useField();
	const headers = {
		userToken: storage.getLocal('token'),
		authType: storage.getLocal('token') ? 1 : 0
	};

	function beforeUpload(info) {
		console.log('beforeUpload : ', info);
	}

	function onChange(info) {
		console.log('onChange : ', info);
	}

	function onSuccess(info) {
		console.log('onSuccess : ', info);
		if (info) {
			Message.show(
				messageConfig(
					'success',
					'成功',
					'chart包上传成功，3秒后刷新数据'
				)
			);
			onCreate();
		}
	}

	function onError(info) {
		console.log('error:', info);
		if (info) {
			const dialog = Dialog.show({
				title: '失败',
				content: '上架失败，不可上传旧版本或者已有版本哦。',
				footer: (
					<Button type="primary" onClick={() => dialog.hide()}>
						我知道了
					</Button>
				)
			});
		}
	}

	const onOk = () => {
		console.log(upload2);
		const uploaderRef = upload2.current.getInstance();
		uploaderRef.startUpload();
	};

	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			footerAlign="right"
			title="中间件上架"
			style={{ width: 450 }}
		>
			<Form {...formItemLayout} field={field}>
				<Form.Item
					label="上传包"
					required
					requiredMessage="请上传chart包"
				>
					<Upload
						action={`${api}/clusters/${globalCluster.id}/middlewares/upload`}
						autoUpload={false}
						beforeUpload={beforeUpload}
						onChange={onChange}
						onSuccess={onSuccess}
						onError={onError}
						listType="text"
						ref={upload2}
						headers={headers}
						limit={1}
					>
						<Button type="primary" style={{ margin: '0 0 10px' }}>
							上传文件
						</Button>
					</Upload>
				</Form.Item>
			</Form>
		</Dialog>
	);
}
export default connect(
	({ globalVar }) => ({ globalVar }),
	{}
)(UploadMiddlewareForm);
