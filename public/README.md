# 中间件平台
基于**Create-React-App**脚手架二次开发
## 依赖下载
yarn install
> *不建议使用**npm**下载，推荐下载**yarn**后使用

>建议node版本 **10.20.1** 可以用**nvm**去切换本地node版本
## 启动项目
yarn start
## 打包项目
yarn build
## 文件目录结构
```
Zeus-ui
	|-- node_modules
	|-- public
	|-- src
	  	|-- assets // 静态资源
			|-- images // 图片
			|-- iconfont.ttf // 字体文件
			|-- iconfont.woff // 字体文件
			|-- iconfont.woff2 // 字体文件
	  	|-- components // 自定义通用业务组件
			|-- ...
			|-- FormXXX 动态表单专用组件
			|-- messageConfig.js // 全局提醒框
			|-- renderFormItem.js // 动态表单生成
	  	|-- layout // 全局布局
			|-- ...
			|-- routes.js // 路由
		|-- locales // 国际化文档，暂时没做
	  	|-- pages // 业务组件
		|-- redux // 全局redux
		|-- services // 接口定义
		|-- styles //
			|-- _mixin.scss // scss的常用代码块
			|-- _vars.scss // 系统的自定义变量
			|-- iconfont.scss // 自定义字体样式
		|-- utils // 全局实用工具函数
			|-- ...
			|-- url.js // 后端地址设置
		|-- index.css // 全局css 可进行组件的样式覆盖（注意样式污染问题）
		|-- index.js // 入口文件
		|-- api.json // 接口路由配置
		|-- setupProxy.js // 本地接口代理
		|-- ...
	|-- .env.development // 开发环境变量，没用到
	|-- .env.production // 生产环境变量，没用到
	|-- config-overrides.js // webpack配置
	|-- Dockerfile // docker文件，用于流水线
	|-- nginx.conf // 线上nginx配置，了解一下
	|-- ...
```
#### Commit规范
```bash
# ======== Git提交message规范 ========
# 主要type
# feat:     增加新功能
# fix:      修复bug
# feat, fix 都需要在 commit content之后关联issue编号
# 例如: fix: 修复总览排版问题#1

# 特殊type
# docs:     只改动了文档相关的内容
# style:    不影响代码含义的改动，例如去掉空格、改变缩进、增删分号
# build:    构造工具的或者外部依赖的改动，例如webpack，npm
# refactor: 代码重构时使用
```
### ui
> [Wind-阿里云UI库](https://aliyun.github.io/alibabacloud-console-components/guides/quick-start)
> Sass: 使用Sass作为预编译css语言

> [UI设计稿地址](https://lanhuapp.com/web/#/item/project/stage?tid=91e1ba1c-10fe-48a7-9ec0-94fda910c29e&pid=6b64213d-5a12-4d70-80e9-9f6a5038e3c1) 使用蓝湖进行设计，具体与UI对接
### 自定义字体文件
>[iconfont-项目](https://www.iconfont.cn/manage/index?spm=a313x.7781069.1998910419.13&manage_type=myprojects&projectId=2602134&keyword=&project_type=&page=)
>该项目由UI设计师维护，当更新字体库时，本地的字体文件也需要相应更新
### 编辑器
> vscode请安装插件【EditorConfig for VS Code】统一编辑器格式
```
具体可查看 .editorconfig 文件
indent_style = tab // 缩进使用tab
indent_size = 4    // 缩进长度为4
```
### code lint
> EsLint + Prettier
> 默认配置，需要额外配置请自行添加 @TODO 最佳实践待整理
```
具体可查看 .eslintignore .eslintrc.json .prettierrc.json
```

> eslint解析配置ecmaVersion为2020
```
babel支持2020语法: ?.[可选连操作符] ??[空位合并操作符]
```
### 关于typescript
项目刚启动初期，使用JavaScript进行开发。在开发调试过程中感受到了JavaScript作为弱类型语言带来的一些麻烦和不确定性。typescript作为JavaScript的超集，是一种强类型语言，能够很好的约束开发人员来增加代码的可读性和健壮性，以便项目之后的开发和维护。
在1.2.0版本中，进行了增量升级，项目代码可以使用typescript进行编写。
目前ts，tsx的代码可以与js和jsx的代码兼容。
在之后新功能的开发中，规定使用ts进行编写，在修改老代码时，首先对老代码进行js->ts的转换升级，直至所有老的js代码更新完成。
