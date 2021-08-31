import React, { useState, useEffect } from 'react';
import { Balloon, Field, Button, Form } from '@alicloud/console-components';
import './index.scss';
/**
 * 此组件是form组件和balloon组件的组合，主要用于气泡表单
 *children内容跟form组件一致，
 *form表单的属性通过formProps设置
 *气泡相关属性与balloon一致
 * 参考如下：
 *{
	 onConfirm={onConfirm}
	 onCancel={onCancel}
	 okText={okText}
	 cancelText={cancelText}
	 formProps={formProps}
	 ...balloonProps 气泡组件属性
 }
 */
function isPromise(obj) {
	return (
		!!obj && //有实际含义的变量才执行方法，变量null，undefined和''空串都为false
		(typeof obj === 'object' || typeof obj === 'function') && // 初始promise 或 promise.then返回的
		typeof obj.then === 'function'
	);
}
const fn = () => {};
const BalloonForm = (props) => {
	// formProps是表单的属性， restProps是气泡的属性
	const {
		trigger,
		formProps = {},
		onConfirm = fn,
		onCancel = fn,
		visible,
		okText,
		cancelText,
		children,
		...restProps
	} = props;
	const [submitLoading, setSubmitLoading] = useState(false);
	const [balloonVisible, setBalloonVisible] = useState(false);
	const field = Field.useField();
	const hasVisible = visible !== undefined;

	useEffect(() => {
		setBalloonVisible(visible);
	}, [visible]);

	const handleCancel = () => {
		if (!hasVisible) {
			setBalloonVisible(false);
		}
		onCancel && onCancel();
	};

	const handleConfirm = () => {
		let result;
		field.validate((err, data) => {
			if (!err) {
				result = onConfirm(data);
				// 如果onConfirm返回一个promise,则设置按钮状态为loading,异步函数执行完毕关闭弹窗
				if (isPromise(result)) {
					setSubmitLoading(true);
					result.then(() => {
						setSubmitLoading(false);
						if (!hasVisible) {
							// 如果没有手动设置visible属性，则关闭弹窗
							setBalloonVisible(false);
						}
					});
				} else {
					if (!hasVisible) {
						setBalloonVisible(false);
					}
				}
			}
		});
		return result;
	};
	const toggleVisible = () => {
		setBalloonVisible(!balloonVisible);
	};
	const balloonTrigger = hasVisible ? (
		trigger
	) : (
		<span onClick={toggleVisible}>{trigger}</span>
	);

	const ItemLayout = {
		labelCol: { fixedSpan: 6 },
		wrapperCol: { span: 18 },
		...formProps
	};

	return (
		<Balloon
			triggerType="click"
			className="balloon-form-confirm"
			{...restProps}
			trigger={balloonTrigger}
			visible={balloonVisible}
		>
			<Form className="balloon-content" {...ItemLayout} field={field}>
				{children}
				<div className="footer">
					<Button
						onClick={handleConfirm}
						className="confirm"
						type="primary"
						loading={submitLoading}
					>
						{okText || '确认'}
					</Button>
					<Button onClick={handleCancel} className="cancel">
						{cancelText || '取消'}
					</Button>
				</div>
			</Form>
		</Balloon>
	);
};
export default BalloonForm;
