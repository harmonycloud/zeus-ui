import React from 'react';
import {
	HashRouter as Router,
	Route,
	Switch,
	Redirect,
	withRouter
} from 'react-router-dom';
import MdBreadcrumb from './Breadcrumb/Breadcrumb';
import Home from '@/pages/Home/index';
import ServiceCatalog from '@/pages/ServiceCatalog/index';
import MysqlCreate from '@/pages/ServiceCatalog/Mysql/create';
import RedisCreate from '@/pages/ServiceCatalog/Redis/create';
import ElasticsearchCreate from '@/pages/ServiceCatalog/Elasticsearch/create';
import RocketMQCreate from '@/pages/ServiceCatalog/RocketMQ/create';
import InstanceList from '@/pages/InstanceList/index';
import InstanceDetails from '@/pages/InstanceList/Detail/index';
import Ingress from '@/pages/Ingress/index';
import PlatformOverview from '@/pages/PlatformOverview/index';
import BasicResource from '@/pages/BasicResource/index';
import AuthManage from '@/pages/AuthManage/index';
import DynamicForm from '@/pages/ServiceCatalog/DynamicForm';
import OperationAudit from '@/pages/OperationAudit/index';
import UserManage from '@/pages/UserManage';
import OperationAuditDetail from '@/pages/OperationAudit/detail';

const Routes = withRouter((props) => {
	return (
		<>
			<MdBreadcrumb pathname={props.location.pathname} />
			<Switch>
				<Route
					path="/"
					exact
					render={() => <Redirect to="/dataOverview" />}
				/>
				{/* 弓箭总览 ——已废除的一张页面 */}
				{/* <Route path="/dataOverview" component={Home} exact /> */}
				{/* 数据总览  */}
				<Route
					path="/dataOverview"
					component={PlatformOverview}
					exact
				/>
				{/* 中间件仓库 */}
				<Route
					path="/middlewareRepository"
					component={ServiceCatalog}
					exact
				/>
				{/* 4款中间件发布 + 动态表单的发布*/}
				<Route
					path="/middlewareRepository/mysqlCreate/:chartName/:chartVersion"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/middlewareRepository/mysqlCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/middlewareRepository/mysqlCreate/:chartName/:chartVersion/:disasterOriginName"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/middlewareRepository/redisCreate/:chartName/:chartVersion"
					component={RedisCreate}
					exact
				/>
				<Route
					path="/middlewareRepository/redisCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={RedisCreate}
				/>
				<Route
					path="/middlewareRepository/elasticsearchCreate/:chartName/:chartVersion"
					component={ElasticsearchCreate}
					exact
				/>
				<Route
					path="/middlewareRepository/elasticsearchCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={ElasticsearchCreate}
				/>
				<Route
					path="/middlewareRepository/rocketmqCreate/:chartName/:chartVersion"
					component={RocketMQCreate}
				/>
				<Route
					path="/middlewareRepository/rocketmqCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={RocketMQCreate}
				/>
				<Route
					path="/middlewareRepository/dynamicForm/:chartName/:chartVersion/:version"
					component={DynamicForm}
				/>
				{/* 服务列表 */}
				<Route path="/serviceList" component={InstanceList} exact />
				{/* 服务详情 */}
				<Route
					path="/instanceList/detail/:middlewareName/:type/:chartVersion"
					component={InstanceDetails}
					exact
				/>
				{/* 服务暴露 */}
				<Route path="/serviceAvailable" component={Ingress} exact />
				{/*
					监控告警——未完成
					容灾备份——未完成
				*/}
				{/* 基础资源——已废弃 */}
				<Route path="/basicResource" component={BasicResource} exact />
				{/* 授权管理——已废弃 */}
				<Route
					path="/systemManagement/authManage"
					component={AuthManage}
					exact
				/>
				{/* 用户管理 */}
				<Route
					path="/systemManagement/userManage"
					component={UserManage}
					exact
				/>
				{/* 角色管理——未完成 */}
				{/* 操作审计 */}
				<Route
					path="/systemManagement/operationAudit"
					component={OperationAudit}
					exact
				/>
				<Route
					path="/systemManagement/operationAudit/:account"
					component={OperationAuditDetail}
					exact
				/>
				{/* 资源池管理——未完成 */}
			</Switch>
		</>
	);
});

export default () => (
	<Router>
		<Routes />
	</Router>
);
