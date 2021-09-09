import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Radio } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { getMiddlewareRepository } from '@/services/repository';
import { StoreState, globalVarProps } from '@/types/index';
import './index.scss';

const RadioGroup = Radio.Group;
interface middlewareRepositoryProps {
	globalVar: globalVarProps;
}
function MiddlewareRepository(props: middlewareRepositoryProps): JSX.Element {
	console.log(props);
	const {
		globalVar: { cluster, namespace }
	} = props;
	const [rule, setRule] = useState<string>('type');
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			getMiddlewareRepository({
				clusterId: cluster.id,
				namespace: namespace.name
			}).then((res) => {
				console.log(res);
			});
		}
		return () => {
			mounted = false;
		};
	}, [namespace]);
	return (
		<Page>
			<Header
				title="中间件仓库"
				subTitle="不同类型中间件上/下架、升级管理等"
			/>
			<Content>
				<div className="middleware-repository-tips">
					自定义上架中间件，请参考
					<span className="name-link">
						《自定义开发，上架中间件规范说明》
					</span>
				</div>
				<div className="middleware-repository-action-layout">
					<Button type="primary">上架中间件</Button>
					<RadioGroup
						dataSource={[
							{ value: 'type', label: '类型' },
							{ value: 'source', label: '来源' }
						]}
						shape="button"
						size="large"
						value={rule}
						onChange={(value) => setRule(value as string)}
					/>
				</div>
			</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(MiddlewareRepository);
