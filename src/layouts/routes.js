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
				{/* ????????????  */}
				<Route
					path="/dataOverview"
					component={PlatformOverview}
					exact
				/>
				{/* ??????????????? */}
				<Route
					path="/middlewareRepository"
					component={MiddlewareRepository}
					exact
				/>
				{/* ???????????? */}
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
				{/* ???????????????-???????????? */}
				<Route
					path="/middlewareRepository/versionManagement/:type/:clusterId"
					component={MiddlewareVersion}
				/>
				{/* 4?????????????????? + ?????????????????????*/}
				<Route
					path="/serviceList/:chartName/:aliasName/mysqlCreate/:chartVersion"
					component={MysqlCreate}
					exact
				/>
				{/* mysql?????????????????? */}
				<Route
					path="/serviceList/:chartName/:aliasName/mysqlCreate/:chartVersion/:middlewareName/backup/:backupFileName/:namespace"
					component={MysqlCreate}
					exact
				/>
				{/* mysql?????????????????? - ??????state??????disasterOriginName???????????????????????? */}
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
				{/* redis?????????????????? */}
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
				{/* elasticsearch?????????????????? */}
				<Route
					path="/serviceList/:chartName/:aliasName/elasticsearchCreate/:chartVersion/:middlewareName/backup/:namespace"
					component={ElasticsearchCreate}
					exact
				/>
				<Route
					path="/serviceList/:chartName/:aliasName/rocketmqCreate/:chartVersion"
					component={RocketMQCreate}
					exact
				/>
				{/* rocketmq?????????????????? */}
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
				{/* pgsql?????????????????? */}
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
				{/* ???????????? */}
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
				{/* ???????????? - ????????????*/}
				<Route
					path="/serviceList/:name/:aliasName/serverVersion/:middlewareName/:type/:namespace"
					component={ServiceVersion}
				/>
				{/* ???????????? - ????????????*/}
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
				{/* ???????????? */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/template/:middlewareName/:type/:chartVersion/:namespace"
					component={EditParamTemplate}
					exact
				/>
				{/* ???????????? */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/compareTemplate/:type/:chartVersion/:uid1/:uid2/:namespace/compare"
					component={CompareParamTemplate}
					exact
				/>
				{/* ???????????? */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/template/:middlewareName/:type/:chartVersion/:uid/:templateName/:namespace"
					component={EditParamTemplate}
					exact
				/>
				{/* ???????????? */}
				<Route
					path="/serviceList/:name/:aliasName/paramterSetting/useTemplate/:middlewareName/:type/:chartVersion/:uid/:namespace"
					component={UseTemplate}
					exact
				/>
				{/* ???????????? */}
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
				{/* ?????????????????????????????? */}
				<Route
					path="/monitorAlarm/dataMonitor"
					component={DataMonitor}
					exact
				/>
				{/* ?????????????????????????????? */}
				<Route
					path="/monitorAlarm/logDetail"
					component={LogDetail}
					exact
				/>
				{/* ?????????????????????????????? */}
				<Route
					path="/monitorAlarm/alarmCenter"
					component={AlarmCenter}
					exact
				/>
				{/* ?????????????????????????????? */}
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
				{/* ?????????????????????????????? */}
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
					path="/serviceList/:name/:aliasName/:currentTab/backupTaskDetail/:middlewareName/:type/:chartVersion/:namespace/:backupName"
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
				{/* ???????????? */}
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
				{/* ???????????? */}
				<Route
					path="/systemManagement"
					exact
					render={() => (
						<Redirect to="/systemManagement/userManagement" />
					)}
				/>
				{/* ???????????? */}
				<Route
					path="/systemManagement/userManagement"
					component={UserManage}
					exact
				/>
				{/* ???????????? */}
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
				{/* ???????????? */}
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
				{/* ???????????? */}
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
				{/* ???????????? */}
				<Route
					path="/systemManagement/projectManagement"
					component={ProjectManage}
					exact
				/>
				{/* ????????? */}
				<Route path="/terminal/:url" component={MidTerminal} exact />
				{/* ??????????????? */}
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
