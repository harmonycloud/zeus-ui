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
import MidTerminal from '@/components/MidTerminal';
import ServiceListByType from '@/pages/ServiceList/serviceListByType';
import Personlization from '@/pages/Personalization/index';
import ServiceVersion from '@/pages/ServiceList/serviceVersion';
import ResourcePoolDetail from '@/pages/ResourcePoolManagement/detail';
import SystemAlarm from '@/pages/SystemAlarm';
import CreateAlarm from '@/pages/InstanceList/Detail/ServeAlarm/create';
import GuidePage from '@/pages/GuidePage';
import BackupSetting from '@/pages/InstanceList/Detail/BackupRecovery/backupSetting';
import YamlEdit from '@/pages/InstanceList/Detail/HighAvailability/yamlEdit';
// ! 已弃用组件
// import ServiceList from '@/pages/ServiceList';
// import BasicResource from '@/pages/BasicResource/index';
// import AuthManage from '@/pages/AuthManage/index';
// import Ingress from '@/pages/Ingress/index';
// import Home from '@/pages/Home/index';
// import InstanceList from '@/pages/InstanceList/index';

const Routes = withRouter((props) => {
	return (
		<>
			{props.location.pathname !== '/systemManagement/operationAudit' ? (
				<MdBreadcrumb pathname={props.location.pathname} />
			) : null}
			<Switch>
				<Route
					path="/"
					exact
					render={() => <Redirect to="/dataOverview" />}
				/>
				{/* 空间总览 ——已废除的一张页面 */}
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
				{/* 中间件市场-版本管理 */}
				<Route
					path="/middlewareRepository/versionManagement/:type"
					component={MiddlewareVersion}
				/>
				{/* 4款中间件发布 + 动态表单的发布*/}
				<Route
					path="/serviceList/mysqlCreate/:aliasName/:chartName/:chartVersion"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceList/mysqlCreate/:aliasName/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceList/mysqlCreate/:aliasName/:chartName/:chartVersion/:middlewareName"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceList/mysqlCreate/:chartName/:chartVersion"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceList/redisCreate/:aliasName/:chartName/:chartVersion"
					component={RedisCreate}
					exact
				/>
				<Route
					path="/serviceList/redisCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={RedisCreate}
				/>
				<Route
					path="/serviceList/elasticsearchCreate/:aliasName/:chartName/:chartVersion"
					component={ElasticsearchCreate}
					exact
				/>
				<Route
					path="/serviceList/elasticsearchCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={ElasticsearchCreate}
				/>
				<Route
					path="/serviceList/rocketmqCreate/:aliasName/:chartName/:chartVersion"
					component={RocketMQCreate}
				/>
				<Route
					path="/serviceList/rocketmqCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={RocketMQCreate}
				/>
				<Route
					path="/serviceList/dynamicForm/:aliasName/:chartName/:chartVersion/:version"
					component={DynamicForm}
				/>
				{/* 服务列表 */}
				<Route path="/serviceList" component={GuidePage} exact />
				<Route
					path="/serviceList/:name/:aliasName"
					component={ServiceListByType}
					exact
				/>
				<Route
					path="/serviceList/createAlarm"
					component={CreateAlarm}
					exact
				/>
				{/* <Route
					path="/serviceList/issueService"
					component={MiddlewareRepository}
					exact
				/> */}
				{/* 服务详情 - 版本管理*/}
				<Route
					path="/serviceList/serverVersion/:type/:service"
					component={ServiceVersion}
				/>
				{/* 服务详情 - 实例详情*/}
				<Route
					path="/serviceList/:currentTab/:middlewareName/:type/:chartVersion"
					component={InstanceDetails}
					exact
				/>
				<Route
					path="/serviceList/highAvailability/yamlDetail/:middlewareName/:type/:chartVersion/:clusterId/:namespace"
					component={YamlEdit}
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
				<Route
					path="/monitorAlarm"
					exact
					render={() => <Redirect to="/monitorAlarm/dataMonitor" />}
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
					path="/disasterBackup"
					exact
					render={() => (
						<Redirect to="/disasterBackup/disasterCenter" />
					)}
				/>
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
				<Route
					path="/disasterBackup/dataSecurity/addBackup"
					component={BackupSetting}
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
				<Route
					path="/systemManagement"
					exact
					render={() => (
						<Redirect to="/systemManagement/userManagement" />
					)}
				/>
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
					path="/systemManagement/resourcePoolManagement/addResourcePool"
					component={AddResourcePool}
					exact
				/>
				<Route
					path="/systemManagement/resourcePoolManagement/addResourcePool/addOther"
					component={AddForm}
					exact
				/>
				<Route
					path="/systemManagement/resourcePoolManagement/addResourcePool/addOther/:clusterId"
					component={AddForm}
					exact
				/>
				<Route
					path="/systemManagement/resourcePoolManagement/editResourcePool/editOther/:clusterId"
					component={AddForm}
					exact
				/>
				<Route
					path="/systemManagement/resourcePoolManagement/resourcePoolDetail/:id/:nickname"
					component={ResourcePoolDetail}
					exact
				/>
				<Route
					path="/systemManagement/systemAlarm"
					component={SystemAlarm}
					exact
				/>
				<Route
					path="/systemManagement/createAlarm"
					component={CreateAlarm}
					exact
				/>
				{/* 控制台 */}
				<Route path="/terminal/:url" component={MidTerminal} exact />
				{/* 个性化设置 */}
				<Route
					path="/dataOverview/personlization"
					component={Personlization}
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
