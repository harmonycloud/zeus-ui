import { api } from '@/api.json';
// * 登录控制台
export const AuthLogin = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/auth`;
// * 查询数据库列表
export const getDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases`;
// * 查询字符集
export const getCharset = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/charsets`;
// * 查询校验规则
export const getCollation = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/charsets/{charset}/collations`;
// * 删除数据库
export const deleteDb = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}`;
// * 创建/编辑数据库
export const updateDb = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases`;
// * 查看数据库所有表
export const getDbTables = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables`;
// * 查看表所有列
export const getCols = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/columns`;
// * 查看表所有索引
export const getIndexs = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/indices`;
// * mysql 删除数据表
export const deleteMysqlTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tabes/{table}`;
// * 查询用户列表
export const getMysqlUsers = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/users`;
// * pgsql 获取模式列表 / 创建模式
export const getSchemas = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas`;
// * pgsql 删除模式 / 编辑模式 / 获取模式详情
export const updateSchemas = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}`;
// * pgsql 获取table列表 / 创建table列表
export const getPgTables = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables`;
// * pgsql 删除table列表
export const deletePgTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}`;
// * pgsql 获取cols
export const getPgCols = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/columns`;
// * pgsql 获取字符集
export const getEncoding = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/encoding`;
// * pgsql 新建数据库
export const createPgDatabase = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases`;
// * pgsql 修改数据库
export const updatePgDatabase = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}`;
// * mysql 重置密码
export const resetMysqlPassword = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/users/{username}/password`;
// * pgsql 重置密码
export const resetPgsqlPassword = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/users/{username}/reset`;
// * pgsql 启用/禁用用户
export const enablePgsqlUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/users/{username}/enable`;
// * mysql 启用/禁用用户
export const enalbeMysqlUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/users/{username}/{lock}`;
// * mysql 授权数据库
export const mysqlAuthDatabase = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/privilege`;
// * mysql 授权数据表
export const mysqlAuthTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/privilege`;
// * pgsql 授权
export const pgsqlAuth = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/users/{username}/authority`;
// * pgsql 导出数据表结构
export const getPgsqlExcel = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/excel`;
// * pgsql 导出建表语句
export const getPgsqlSQL = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/sql`;
// * mysql 导出数据表结构
export const getMysqlExcel = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/excelFile`;
// * mysql 导出建表语句
export const getMysqlSQL = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/scriptFile`;
// * pgsql 获取表详情
export const getPgsqlTableDetail = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}`;
// * mysql 获取表格数据
export const getMysqlData = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/data`;
// * pgsql 获取表格数据
export const getPgsqlData = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/data`;
// * pgsql 修改表接口
export const updatePgTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{table}`;
// * mysql 修改表接口
export const updateMysqlTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tabes/{table}`;
// * pgsql 获取数据类型
export const getPgsqlDataType = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/dataType`;
// * pgsql 获取校验规则
export const getPgsqlCollate = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/collate`;
// * mysql 获取表格详情
export const getMysqlDetail = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}`;
// * pgsql 增删外键约束
export const updatePgsqlForeign = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/foreign`;
// * pgsql 增删排他性约束
export const updatePgsqlExclusion = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/exclusion`;
// * pgsql 增删唯一约束
export const updatePgsqlUnique = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/unique`;
// * pgsql 增删检查约束
export const updatePgsqlCheck = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/check`;
// * pgsql 增删继承关系
export const updatePgsqlInherit = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/inherit`;
// * pgsql 更新table (基本信息tab)
export const updatePgsqlInfo = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schema}/tables/{table}`;
// * pgsql 更新列信息
export const updatePgsqlCol = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/columns`;
// * mysql 获取数据类型列表
export const getMysqlDataType = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/datatype`;
// * mysql 创建表
export const createMysqlTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables`;
// * mysql 查询数据引擎
export const getMysqlEngine = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/engines`;
// * mysql 修改表信息
export const updateMysqlTableInfo = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tabes/{table}`;
// * mysql 修改列信息
export const updateMysqlCol = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/columns`;
// * mysql 修改索引信息
export const updateMysqlIndex = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/indices`;
// * mysql 修改外键信息
export const updateMysqlForeign = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/foreignKeys`;
// * ------------------------------------------------------------------------
// * redis 获取全部数据库
export const getRedisDBs = `${api}/clusters/{clusterId}/namespaces/{namespace}/redis/{middlewareName}/databases`;
// * redis 执行cmd
export const executeCMD = `${api}/clusters/{clusterId}/namespaces/{namespace}/redis/{middlewareName}/databases/{database}/cmd`;
// * redis 查看执行记录
export const getRedisExecuteRecords = `${api}/clusters/{clusterId}/namespaces/{namespace}/redis/{middlewareName}/databases/{database}/cmd/history`;
// * redis 查询指定库的所有key
export const getRedisKeys = `${api}/clusters/{clusterId}/namespaces/{namespace}/redis/{middlewareName}/databases/{database}/keys`;
// * redis 查询指定key的value / 修改key信息/ 保存k-v / 删除key
export const getRedisValue = `${api}/clusters/{clusterId}/namespaces/{namespace}/redis/{middlewareName}/databases/{database}/keys/{key}`;
// * redis修改/删除value
export const deleteRedisValue = `${api}/clusters/{clusterId}/namespaces/{namespace}/redis/{middlewareName}/databases/{database}/keys/{key}/value`;
// *--------------------------------------------------
// * mysql & pgsql 合并接口 可能与上面接口存在重复
// * 合并 查询数据库列表
export const getAllDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/databases`;
// * 合并 删除数据库列表
export const deleteAllDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/databases/{databaseName}`;
// * 合并 获取用户列表
export const getUsers = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users`;
// * 合并 删除用户
export const deleteUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}`;
// * 合并 新增用户
export const createUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users`;
// * 合并 获取用户权限详情
export const getUserAuth = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}/authority`;
// * 合并 取消授权
export const cancelAuth = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}/authority`;
