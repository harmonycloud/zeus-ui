import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Page, Content, Header } from '@alicloud/console-components-page';
import {
	Button,
	Form,
	Upload,
	Icon,
	Input,
	Radio,
	Field
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import './index.scss';

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 10
	}
};

function Personlization(): JSX.Element {
	const history = useHistory();
	const field: Field = Field.useField();

	// useEffect(() => {

	// }, [])

	const onSubmit = () => {
		field.validate((errors, values) => {
			if (errors) return;
			console.log(values);
		});
	};

	return (
		<Page className="personlization">
			<Header
				hasBackArrow
				renderBackArrow={(elem) => (
					<span
						className="details-go-back"
						onClick={() => window.history.back()}
					>
						{elem}
					</span>
				)}
				title="个性化"
				subTitle="自定义登陆页背景、logo、平台名称等"
			/>
			<Content>
				<Form field={field} {...formItemLayout}>
					<h2>登陆页配置</h2>
					<Form.Item label="背景" required labelTextAlign="left">
						<Upload
							style={{ display: 'inline' }}
							listType="card"
							action="//upload-server.alibaba.net/upload.do"
							accept="image/jpg,image/png,image/svg"
							limit={1}
							defaultValue={[
								{
									name: 'IMG.png',
									state: 'done',
									size: 1024,
									downloadURL:
										'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg',
									fileURL:
										'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg',
									imgURL: 'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg'
								}
							]}
						>
							<div className="next-upload-card">
								<Icon type="upload" size="large" />
								<div className="next-upload-text">上传</div>
							</div>
						</Upload>
						<p className="upload-info">
							图片支持2M以下的jpg、svg、png格式
						</p>
					</Form.Item>
					<Form.Item
						label="登陆页logo"
						required
						labelTextAlign="left"
					>
						<Upload
							style={{ display: 'inline' }}
							action="//upload-server.alibaba.net/upload.do"
							listType="image"
							limit={1}
							defaultValue={[
								{
									name: 'IMG.png',
									state: 'done',
									size: 1024,
									downloadURL:
										'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg',
									fileURL:
										'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg',
									imgURL: 'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg'
								}
							]}
						>
							<Button>
								<Icon type="upload" />
								上传
							</Button>
						</Upload>
						<p className="upload-info">图片支持2M以下的svg格式</p>
					</Form.Item>
					<Form.Item
						label="平台名称"
						labelTextAlign="left"
						maxLength={30}
						minmaxLengthMessage="长度不能超过30个字符"
					>
						<Input
							name="111"
							placeholder="我是平台名称，支持空格，限定在30字符内"
						/>
					</Form.Item>
					<Form.Item
						label="Slogan"
						labelTextAlign="left"
						maxLength={50}
						minmaxLengthMessage="长度不能超过50个字符"
					>
						<Input.TextArea placeholder="产品说明，字数限定在50字符" />
					</Form.Item>
					<Form.Item
						label="版本声明"
						labelTextAlign="left"
						maxLength={30}
						minmaxLengthMessage="长度不能超过30个字符"
					>
						<Input placeholder="我是版权声明，支持空格，限定在30字符内" />
					</Form.Item>
					<h2>登陆后系统页配置</h2>
					<Form.Item
						label="左上角logo"
						required
						labelTextAlign="left"
					>
						<Upload
							style={{ display: 'inline' }}
							listType="card"
							action="//upload-server.alibaba.net/upload.do"
							limit={1}
							defaultValue={[
								{
									name: 'IMG.png',
									state: 'done',
									size: 1024,
									downloadURL:
										'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg',
									fileURL:
										'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg',
									imgURL: 'https://img.alicdn.com/tps/TB19O79MVXXXXcZXVXXXXXXXXXX-1024-1024.jpg'
								}
							]}
						>
							<div className="next-upload-card">
								<Icon type="upload" size="large" />
								<div className="next-upload-text">上传</div>
							</div>
						</Upload>
						<p className="upload-info">图片支持2M以下的svg格式</p>
					</Form.Item>
					<Form.Item
						label="浏览器tab标题"
						required
						requiredMessage="请输入浏览器标题"
						labelTextAlign="left"
						maxLength={20}
						minmaxLengthMessage="长度不能超过20个字符"
					>
						<Input
							name="222"
							placeholder="我是浏览器标题，字数限制在20字符"
						/>
					</Form.Item>
					<h2>恢复出厂设置</h2>
					<Form.Item label="是否恢复初始化" labelTextAlign="left">
						<Radio.Group defaultValue="0">
							<Radio id="no" value="0">
								否
							</Radio>
							<Radio id="yes" value="1">
								是
							</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
				<div className="detail-divider" />
				<div>
					<Button type="primary" onClick={onSubmit}>
						提交
					</Button>
					<Button
						style={{ marginLeft: '5px' }}
						onClick={() => field.reset()}
					>
						取消
					</Button>
				</div>
			</Content>
		</Page>
	);
}

export default Personlization;
