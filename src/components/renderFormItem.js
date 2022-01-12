import React from 'react';
import FormInput from '@/components/FormInput';
import FormSelectOrRadios from '@/components/FormSelectOrRadios';
import FormSwitch from '@/components/FormSwitch';
import FormNumber from '@/components/FormNumber';
import FormTextArea from '@/components/FormTextArea';
import FormPassword from '@/components/FormPassWord';
import FormNodeAffinity from '@/components/FormNodeAffinity';
import FormList from '@/components/FormList';
import FormStorageClass from '@/components/FormStorageClass';
import FormPVC from '@/components/FormPVC';
import FormSecret from '@/components/FormSecret';
import FormTolerations from './FormTolerations';

/*
 *	名称 —— 对应后端判断
 *	input 普通输入框 —— string
 *	number 数字输入框 —— int
 *	password 密码输入框 —— password
 *	textarea 多行输入框 —— multiline
 *	switch 开关 —— boolean
 *	list 添加列表 ? —— 动态表单未涉及 —— list
 *	select 选择框 通过options的长度进行判断显示方式 —— enum
 *	multiSelect 多选框 ? —— 动态表单未涉及 —— 暂无
 *	nodeAffinity 主机亲和 —— nodeAffinity
 *	storageclass 存储 选择框 下拉项通过接口获取 —— storageclass
 *	pvc pvc 选择框 下拉项通过接口获取 —— pvc
 *	secret secret 选择框 下拉项通过接口获取 —— secret
 */

/*
	todo 将样式抽成属性
	todo field、 namespace 和 cluster 的传递

	! 未完成
	! FormList
	! multiSelect
*/
export const renderFormItem = (
	formValue,
	field = {},
	cluster = {},
	namespace = {}
) => {
	switch (formValue.type) {
		case 'string':
			return <FormInput {...formValue} />;
		case 'enum':
			return <FormSelectOrRadios {...formValue} field={field} />;
		case 'boolean':
			return (
				<FormSwitch
					{...formValue}
					cluster={cluster}
					namespace={namespace}
				/>
			);
		case 'int':
			return <FormNumber {...formValue} />;
		case 'multiline':
			return <FormTextArea {...formValue} />;
		case 'password':
			return <FormPassword {...formValue} />;
		case 'nodeAffinity':
			return (
				<FormNodeAffinity
					{...formValue}
					field={field}
					cluster={cluster}
					namespace={namespace}
				/>
			);
		case 'tolerations':
			return (
				<FormTolerations
					{...formValue}
					field={field}
					cluster={cluster}
					namespace={namespace}
				/>
			);
		case 'list': //todo 未完成
			return <FormList {...formValue} />;
		case 'storageclass':
			return (
				<FormStorageClass
					{...formValue}
					cluster={cluster}
					namespace={namespace}
					// field={field}
				/>
			);
		case 'pvc':
			return (
				<FormPVC
					{...formValue}
					cluster={cluster}
					namespace={namespace}
				/>
			);
		case 'secret':
			return (
				<FormSecret
					{...formValue}
					cluster={cluster}
					namespace={namespace}
				/>
			);
		default:
			break;
	}
};
