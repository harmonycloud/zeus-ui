import React from 'react';
import {
	HashRouter as Router,
	Route,
	Switch,
	Redirect,
	withRouter
} from 'react-router-dom';
import MdBreadcrumb from './Breadcrumb/Breadcrumb';
import MysqlCreate from '@/pages/ServiceCatalog/Mysql/create';
import RedisCreate from '@/pages/ServiceCatalog/Redis/create';
import ElasticsearchCreate from '@/pages/ServiceCatalog/Elasticsearch/create';
import RocketMQCreate from '@/pages/ServiceCatalog/RocketMQ/create';
import KafkaCreate from '@/pages/ServiceCatalog/Kafka/create';
import zookeeperCreate from '@/pages/ServiceCatalog/Zookeeper/create';
import PostgreSQLCreate from '@/pages/ServiceCatalog/PostgreSQL/create';
import InstanceDetails from '@/pages/ServiceListDetail/index';
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
import Personlization from '@/pages/PlatformManagement/index';
import ServiceVersion from '@/pages/ServiceList/serviceVersion';
import ResourcePoolDetail from '@/pages/ResourcePoolManagement/detail';
import SystemAlarm from '@/pages/SystemAlarm';
import CreateAlarm from '@/pages/ServiceListDetail/ServeAlarm/create';
import GuidePage from '@/pages/GuidePage';
import YamlEdit from '@/pages/ServiceListDetail/HighAvailability/yamlEdit';
import EditParamTemplate from '@/pages/ServiceListDetail/ParamterSetting/editParamTemplate';
import CompareParamTemplate from '@/pages/ServiceListDetail/ParamterSetting/compareParamTemplate';
import UseTemplate from '@/pages/ServiceListDetail/ParamterSetting/useTemplate';
import AddServiceAvailableForm from '@/pages/ServiceAvailable/AddServiceAvailableForm';
import ProjectManage from '@/pages/ProjectManage';
import MyProject from '@/pages/MyProject';
import ProjectDetail from '@/pages/ProjectDetail';
import AllotRole from '@/pages/RoleManage/allotRole';
import BackupTask from '@/pages/BackupService/proBackupTask';
import AddBackupTask from '@/pages/BackupService/addBackupTask';
import BackupTaskDetail from '@/pages/BackupService/backupTaskDetail';
import BackupPosition from '@/pages/BackupService/backupPosition';
import AddBackupPosition from '@/pages/BackupService/addBackupPosition';
import StorageManagement from '@/pages/StorageManagement';
import AddStorage from '@/pages/StorageManagement/addStorage';
import StorageDetail from '@/pages/StorageManagement/storageDetail';

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
				{/* 我的项目 */}
				<Route path="/myProject" component={MyProject} exact />
				<Route
					path="/myProject/projectDetail/:id/:name"
					component={ProjectDetail}
					exact
				/>
				<Route
					path="/systemManagement/projectManagement/projectDetail/:id/:name"
					component={ProjectDetail}
					exact
				/>
				{/* 中间件市场-版本管理 */}
				<Route
					path="/middlewareRepository/versionManagement/:type"
					component={MiddlewareVersion}
				/>
				{/* 4款中间件发布 + 动态表单的发布*/}
				<Route
					path="/serviceList/:chartName/:aliasName/mysqlCreate/:chartVersion"
					component={MysqlCreate}
					exact
				/>
				{/* mysql备份跳转使用 */}
				<Route
					path="/serviceList/:chartName/:aliasName/mysqlCreate/:chartVersion/:middlewareName/:backupFileName/:namespace"
					component={MysqlCreate}
					exact
				/>
				{/* mysql灾备跳转使用 - 通过state中的disasterOriginName进行判断，可优化 */}
				<Route
					path="/serviceList/:chartName/:aliasName/mysqlCreate/disasterCreate/:middlewareName/:chartVersion/:namespace"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/redisCreate/:chartVersion"
					component={RedisCreate}
					exact
				/>
				{/* redis备份跳转使用 */}
				<Route
					path="/serviceList/:chartName/:aliasName/redisCreate/:chartVersion/:middlewareName/backup/:namespace"
					component={RedisCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/elasticsearchCreate/:chartVersion"
					component={ElasticsearchCreate}
					exact
				/>
				{/* elasticsearch备份跳转使用 */}
				<Route
					path="/serviceList/:chartName/:aliasName/elasticsearchCreate/:chartVersion/:middlewareName/backup/:namespace"
					component={ElasticsearchCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/rocketmqCreate/:chartVersion"
					component={RocketMQCreate}
				/>
				{/* rocketmq备份跳转使用 */}
				<Route
					path="/serviceList/:chartName/:aliasName/rocketmqCreate/:chartVersion/:middlewareName/backup/:namespace"
					component={RocketMQCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/kafkaCreate/:chartVersion"
					component={KafkaCreate}
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/zookeeperCreate/:chartVersion"
					component={zookeeperCreate}
				/>
				{/* pgsql备份跳转使用 */}
				<Route
					path="/serviceList/:chartName/:aliasName/postgresqlCreate/:chartVersion/:middlewareName/:backupFileName/:namespace"
					component={PostgreSQLCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/PostgreSQLCreate/:chartVersion"
					component={PostgreSQLCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/dynamicForm/:chartVersion/:version"
					component={DynamicForm}
				/>
				{/* 服务列表 */}
				<Route path="/serviceList" component={GuidePage} exact />
				<Route
					path="/serviceList/:name/:aliasName"
					component={ServiceListByType}
					exact
				/>
				{/* <Route
					path="/serviceList/createAlarm"
					component={CreateAlarm}
					exact
				/> */}
				{/* 服务详情 - 版本管理*/}
				<Route
					path="/serviceList/:name/:aliasName/serverVersion/:middlewareName/:type/:namespace"
					component={ServiceVersion}
				/>
				{/* 服务详情 - 实例详情*/}
				<Route
					path="/serviceList/:name/:aliasName/:currentTab/:middlewareName/:type/:chartVersion/:namespace"
					component={InstanceDetails}
					exact
				/>
				<Route
					path="/serviceList/:name/:aliasName/highAvailability/yamlDetail/:middlewareName/:type/:chartVersion/:clusterId/:namespace"
					component={YamlEdit}
					exact
				/>
				{/* 新建模版 */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/template/:middlewareName/:type/:chartVersion/:namespace"
					component={EditParamTemplate}
					exact
				/>
				{/* 模版对比 */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/compareTemplate/:type/:chartVersion/:uid1/:uid2/:namespace/compare"
					component={CompareParamTemplate}
					exact
				/>
				{/* 编辑模版 */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/template/:middlewareName/:type/:chartVersion/:uid/:templateName/:namespace"
					component={EditParamTemplate}
					exact
				/>
				{/* 使用模版 */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/useTemplate/:middlewareName/:type/:chartVersion/:uid/:namespace"
					component={UseTemplate}
					exact
				/>
				{/* 服务暴露 */}
				<Route
					path="/serviceAvailable"
					component={ServiceAvailable}
					exact
				/>
				<Route
					path="/serviceAvailable/addServiceAvailable"
					component={AddServiceAvailableForm}
					exact
				/>
				<Route
					path="/serviceList/:name/:aliasName/externalAccess/addExternalAccess/:middlewareName/:type/:chartVersion/:namespace"
					component={AddServiceAvailableForm}
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
					path="/backupService/backupTask"
					component={BackupTask}
					exact
				/>
				<Route
					path="/backupService/backupTask/addBackupTask"
					component={AddBackupTask}
					exact
				/>
				<Route
					path="/serviceList/:name/:aliasName/:currentTab/addBackupTask/:middlewareName/:type/:chartVersion/:namespace"
					component={AddBackupTask}
					exact
				/>
				<Route
					path="/backupService/backupTask/detail/:backupName/:type"
					component={BackupTaskDetail}
					exact
				/>
				<Route
					path="/backupService/backupPosition"
					component={BackupPosition}
					exact
				/>
				<Route
					path="/backupService/backupPosition/addBackupPosition"
					component={AddBackupPosition}
					exact
				/>
				<Route
					path="/backupService/backupPosition/addBackupPosition/:id"
					component={AddBackupPosition}
					exact
				/>
				{/* 存储管理 */}
				<Route
					path="/storageManagement"
					component={StorageManagement}
					exact
				/>
				<Route
					path="/storageManagement/create"
					component={AddStorage}
					exact
				/>
				<Route
					path="/storageManagement/edit/:name/:clusterId/:clusterAliasName"
					component={AddStorage}
					exact
				/>
				<Route
					path="/storageManagement/:name/:aliasName/:clusterId"
					component={StorageDetail}
					exact
				/>
				{/* 系统管理 */}
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
				<Route
					path="/systemManagement/roleManagement/allotRole"
					component={AllotRole}
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
				{/* 集群管理 */}
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
				{/* <Route
					path="/systemManagement/resourcePoolManagement/addResourcePool/addOther/:clusterId"
					component={AddForm}
					exact
				/> */}
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
					path="/systemManagement/systemAlarm/createAlarm/:alarmType"
					component={CreateAlarm}
					exact
				/>
				<Route
					path="/systemManagement/systemAlarm/createAlarm/:alarmType/:ruleId"
					component={CreateAlarm}
					exact
				/>
				<Route
					path="/serviceList/:name/:aliasName/:currentTab/createAlarm/:middlewareName/:type/:chartVersion/:clusterId/:namespace"
					component={CreateAlarm}
					exact
				/>
				<Route
					path="/serviceList/:name/:aliasName/:currentTab/createAlarm/:middlewareName/:type/:chartVersion/:clusterId/:namespace/:ruleId"
					component={CreateAlarm}
					exact
				/>
				{/* 项目管理 */}
				<Route
					path="/systemManagement/projectManagement"
					component={ProjectManage}
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
