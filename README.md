# 简介

项目基于 nodejs express mysql typescript 搭建 可快速形成服务的一个项目。只是包含登录 jwt 验证。 附件上传等功能，更多的如何快速生成接口。项目当中没有什么业务逻辑 ，没有详细的业务需求也不知道些什么。

# 描述

### 持久层

基础有三张表 pt_model(模型),pt_model_basic_prop(模型基本属性),pt_model_relation(模型关系)

项目启动或者 初始化的时候，会自动的自动检查数据库，根据上述三张表的数据 对现有的数据库进行调整 增加表，增删改 字段 默认会有 id, create 和 update time

![avatar](http://122.51.77.238/api/upload/get?id=7c8981faf1343c9aa9167e5413b93c2c)


### 动态接口

服务启动后，会根据上述三张表的数据 自动的生成 增/add、save/新增或者修改、删/del、改/update、批量级联增加修改/batchCascadeAdd、批量级联删除/batchCascadeDelete、无线级联查询/queryall、根据条件查响应的关系/query（一对多或者多对一，分页多）、条件条件查询接口.

# 演示地址：

### [点这里](http://122.51.77.238/#/login)

#### 打开可能会有点慢，耐心稍等下

### 账号：admin

### 密码：123

### 登录后 ---> 点击左侧菜单 ----> 系统设置 ---> 模型管理

#### 造点数据不容易 误删


