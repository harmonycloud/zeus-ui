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
					render={() => <Redirect to="/spaceOverview" />}
				/>
				{/* 工作台 */}
				<Route path="/spaceOverview" component={Home} exact />
				<Route
					path="/serviceCatalog"
					component={ServiceCatalog}
					exact
				/>
				<Route
					path="/serviceCatalog/mysqlCreate/:chartName/:chartVersion"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceCatalog/mysqlCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceCatalog/mysqlCreate/:chartName/:chartVersion/:disasterOriginName"
					component={MysqlCreate}
					exact
				/>
				<Route
					path="/serviceCatalog/redisCreate/:chartName/:chartVersion"
					component={RedisCreate}
					exact
				/>
				<Route
					path="/serviceCatalog/redisCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={RedisCreate}
				/>
				<Route
					path="/serviceCatalog/elasticsearchCreate/:chartName/:chartVersion"
					component={ElasticsearchCreate}
					exact
				/>
				<Route
					path="/serviceCatalog/elasticsearchCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={ElasticsearchCreate}
				/>
				<Route
					path="/serviceCatalog/rocketmqCreate/:chartName/:chartVersion"
					component={RocketMQCreate}
				/>
				<Route
					path="/serviceCatalog/rocketmqCreate/:chartName/:chartVersion/:middlewareName/:backupFileName"
					component={RocketMQCreate}
				/>
				<Route
					path="/serviceCatalog/dynamicForm/:chartName/:chartVersion/:version"
					component={DynamicForm}
				/>
				<Route path="/instanceList" component={InstanceList} exact />
				<Route
					path="/instanceList/detail/:middlewareName/:type/:chartVersion"
					component={InstanceDetails}
					exact
				/>
				<Route path="/outboundRoute" component={Ingress} exact />
				<Route
					path="/platformOverview"
					component={PlatformOverview}
					exact
				/>
				<Route path="/basicResource" component={BasicResource} exact />
				<Route path="/authManage" component={AuthManage} exact />
				<Route
					path="/operationAudit"
					component={OperationAudit}
					exact
				/>
				<Route
					path="/operationAudit/:account"
					component={OperationAuditDetail}
					exact
				/>
				<Route path="/userManage" component={UserManage} exact />
			</Switch>
		</>
	);
});

export default () => (
	<Router>
		<Routes />
	</Router>
);
