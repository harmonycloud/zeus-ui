import React from 'react';
import {
	HashRouter as Router,
	Route,
	Switch,
	Redirect,
	withRouter
} from 'react-router-dom';
import MdBreadcrumb from './Breadcrumb/Breadcrumb';
import ServiceCatalog from '@/pages/ServiceCatalog/index';
import MysqlCreate from '@/pages/ServiceCatalog/Mysql/create';
import RedisCreate from '@/pages/ServiceCatalog/Redis/create';
import ElasticsearchCreate from '@/pages/ServiceCatalog/Elasticsearch/create';
import RocketMQCreate from '@/pages/ServiceCatalog/RocketMQ/create';
import InstanceDetails from '@/pages/InstanceList/Detail/index';
import PlatformOverview from '@/pages/PlatformOverview/index';
import DynamicForm from '@/pages/ServiceCatalog/DynamicForm';
import OperationAudit from '@/pages/OperationAudit/index';
import UserManage from '@/pages/UserManage';
import RoleManage from '@/pages/RoleManage';
import OperationAuditDetail from '@/pages/OperationAudit/detail';
import ServiceList from '@/pages/ServiceList';
import ServiceAvailable from '@/pages/ServiceAvailable';
import DataMonitor from '@/pages/DataMonitor';
import LogDetail from '@/pages/LogDetail';
import AlarmCenter from '@/pages/AlarmCenter';
import DisasterCenter from '@/pages/DisasterCenter';
import DataSecurity from '@/pages/DataSecurity';
import MiddlewareRepository from '@/pages/MiddlewareRepository';
import MiddlewareVersion from '@/pages/MiddlewareRepository/middlewareVersion';
import ResourcePoolManagement from '@/pages/ResourcePoolManagement';
import AddResourcePool from '@/pages/ResourcePoolManagement/addResourcePool';
import AddForm from '@/pages/ResourcePoolManagement/addForm';
// ! 已弃用组件
// import BasicResource from '@/pages/BasicResource/index';
// import AuthManage from '@/pages/AuthManage/index';
// import Ingress from '@/pages/Ingress/index';
// import Home from '@/pages/Home/index';
// import InstanceList from '@/pages/InstanceList/index';

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
				{/* 中间件市场 */}
				<Route
					path="/middlewareRepository"
					component={MiddlewareRepository}
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
				{/* 中间件市场-版本管理 */}
				<Route
					path="/middlewareRepository/versionManagement/:type"
					component={MiddlewareVersion}
				/>
				{/* 服务列表 */}
				<Route path="/serviceList" component={ServiceList} exact />
				{/* 服务详情 - 实例详情*/}
				<Route
					path="/serviceList/:currentTab/:middlewareName/:type/:chartVersion"
					component={InstanceDetails}
					exact
				/>
				{/* <Route
					path="/serviceList/highAvailability/:middlewareName/:type/:chartVersion"
					component={InstanceDetails}
					exact
				/> */}
				{/* 服务暴露 */}
				<Route
					path="/serviceAvailable"
					component={ServiceAvailable}
					exact
				/>
				{/* 监控告警——数据监控 */}
				<Route
					path="/monitorAlarm/dataMonitor"
					component={DataMonitor}
					exact
				/>
				{/* 监控告警——日志详情 */}
				<Route
					path="/monitorAlarm/logDetail"
					component={LogDetail}
					exact
				/>
				{/* 监控告警——告警中心 */}
				<Route
					path="/monitorAlarm/alarmCenter"
					component={AlarmCenter}
					exact
				/>
				{/* 容灾备份——灾备中心 */}
				<Route
					path="/disasterBackup/disasterCenter"
					component={DisasterCenter}
					exact
				/>
				{/* 容灾备份——数据安全 */}
				<Route
					path="/disasterBackup/dataSecurity"
					component={DataSecurity}
					exact
				/>
				{/* 基础资源——已废弃 */}
				{/* <Route path="/basicResource" component={BasicResource} exact /> */}
				{/* 授权管理——已废弃 */}
				{/* <Route
					path="/systemManagement/authManage"
					component={AuthManage}
					exact
				/> */}
				{/* 用户管理 */}
				<Route
					path="/systemManagement/userManagement"
					component={UserManage}
					exact
				/>
				{/* 角色管理 */}
				<Route
					path="/systemManagement/roleManagement"
					component={RoleManage}
					exact
				/>
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
				{/* 资源池管理 */}
				<Route
					path="/systemManagement/resourcePoolManagement"
					component={ResourcePoolManagement}
					exact
				/>
				<Route
					path="/systemManagement/addResourcePool"
					component={AddResourcePool}
					exact
				/>
				<Route
					path="/systemManagement/addResourcePool/addOther"
					component={AddForm}
					exact
				/>
				<Route
					path="/systemManagement/addResourcePool/addOther/:clusterId"
					component={AddForm}
					exact
				/>
			</Switch>
		</>
	);
});

export default () => (
	<Router>
		<Routes />
	</Router>
);
