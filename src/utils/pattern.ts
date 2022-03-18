interface patternProps {
	[propsName: string]: string;
}

const pattern: patternProps = {
	name: '^[a-z][a-z0-9-]{0,22}[a-z0-9]$',
	labels: '^[a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+([,][a-zA-Z0-9-./_]+[=][a-zA-Z0-9-./_]+)*$',
	path: '^/$|^(/[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*)+$',
	domain: '[a-z0-9]([-a-z0-9]*[a-z0-9])?(.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*',
	host: '^([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])$',
	ip: '^([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.([0-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])$',
	posInt: '^[1-9]\\d*$',
	nickname: '^[\u4E00-\u9FA5A-Za-z0-9_.-]+$',
	mysqlPwd: '^[a-zA-Z0-9~!@#$%^&*(){}_+=<>?;:.,|-]{1,16}$',
	phone: '^1(3\\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\\d|9[0-35-9])\\d{8}$',
	email: '^(([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5}){1,25})+([;.](([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5}){1,25})+)*$',
	userName: '^[A-Za-z0-9-]{1,10}$',
	aliasName: '^[\u4E00-\u9FA5A-Za-z0-9_.-]{1,18}$',
	roleName: '^[\u4E00-\u9FA5A-Za-z0-9_.-]{1,10}$',
	ingressName: '^[a-z0-9-]{0,40}$',
	paramTemplateName: '[a-z0-9-]{2,30}$'
};

export default pattern;
