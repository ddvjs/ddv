### ddv 基本使用命令

[![Join the chat at https://gitter.im/ddvjs/ddv](https://badges.gitter.im/ddvjs/ddv.svg)](https://gitter.im/ddvjs/ddv?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

>* `ddv` 服务 是基于 `nodejs` 开发的一个方便`前端开发项目`的`服务器`
>* `ddv` 的核心不在于框架，而是整合目前流行的框架和打包功能
>* 减少程序员的`服务部署成本`和`构建环境的配置成本`
>* `ddv` 能自动在服务器自动打包，还可以兼容低版本浏览器，以及`SEO`优化

## 一、安装DDV服务器

|安装方式|npm安装|
|------|------|
|安装命令|`npm -g i ddv`|
|安装命令[[`淘宝镜像`](https://npm.taobao.org/)]|`npm -g i ddv  --registry=https://registry.npm.taobao.org`|

>* `温馨提示`:
>* 不建议使用`cnpm -g i ddv`安装，
>* 因为cnpm版本比较旧，可能会导致全局安装失败
>* 国内如果网速较慢，建议使用淘宝镜像命令安装`ddv`服务器

## 二、添加站点

```shell

ddv -n <app_name> add <path>

```
>* 假如我们需要添加 `/home/test/appxxxx/` 文件夹为站点 ,站点管理名字为 `appxxxx`

```shell

ddv -n "appxxxx" add "/home/test/appxxxx/"

```
>* 或者直接输入

```shell

ddv add "/home/test/appxxxx/"

```

## 三、查看站点状态

```shell

ddv ls

```
>* 当然，查看状态有以下几个别名

```shell

ddv l
ddv ls
ddv list
ddv lists
ddv status

```
>* 以上命令返回的是一个站点状态，如果需要返回json 可以使用一下命令

```shell

ddv jlist

```
>* 如果需要返回json是格式化过的格式可以可以使用一下命令

```shell

ddv prettylist

```

>* 状态参考列表

|转态标识|颜色|状态描述|
|------|------|------|
|Listening|绿|该站点正常运行|
|Runing|黄|该站点正在启动中，建议过1-5秒再重新查询状态|
|Restarting|黄|该站点正在重新启动中，建议过1-5秒再重新查询状态|
|Stoped|红|该站点已经停止运行|
|ErrorConf|红|该站点配置信息错误|
|ErrorMast|红|主线程错误|
|ErrorTrys|红|该站点30秒内崩溃10次，被停止|

>* `温馨提示`
>* `errorConf` `errorMast`错误 可以通过`ddv cat error`来查看历史错误
>* `errorConf` `errorMast`错误 也可以通过`ddv tail error`来监听错误，然后启动程序
>* `errorTrys`错误 可以通过`ddv cat <app_name> error`来查看历史错误
>* `errorTrys`错误 可以通过`ddv tail <app_name> error`来监听错误，然后启动程序

## 四、删除站点

```shell

ddv remove <id|app_name>
ddv remove -n <app_name> -i <id>

```

>* 比如我们要删除app_name为`appxxxx`的站点，那我们可以输入


```shell

ddv remove appxxxx

```

>* 当然，您可以根据您个人的使用习惯选择以下删除别名

```shell

ddv delete -n appxxxx
ddv del -n appxxxx

```

>* 为了能更快捷的操作，我们的删除操作支持使用id来操作
>* 如果你在查询站点列表时候得知`appxxxx`的站点`id`为`1`
>* 您可以使用一下其中一条命令来进行删除

```shell

ddv remove -i 1
ddv delete -i 1
ddv del -i 1

```

>* 如果您想操作的站点不止一个，
>* 比如删除`id`为`1,5,6,8,10,12`，您可以使用以下命令来进行删除


```shell

ddv remove -i 1,5,6,8,10,12
ddv delete -i 1,5,6,8,10,12
ddv del -i 1,5,6,8,10,12

```

## 五、重启站点

```shell

ddv restart <id|app_name>
ddv restart -n <app_name> -i <id>

```

>* 比如我们要重启app_name为`appxxxx`的站点，那我们可以输入


```shell

ddv restart appxxxx
ddv restart -n appxxxx

```

>* 当然，您也可以参考删除站点的方式，来使用`id`操作站点重启


## 六、停止站点

>* 有时候，可能我们只是想暂时停止这个项目的启动，
>* 那我们可以使用停止某个站点服务命令

```shell

ddv stop <id|app_name>
ddv stop -n <app_name> -i <id>

```

>* 比如我们要停止app_name为`appxxxx`的站点，那我们可以输入


```shell

ddv stop appxxxx
ddv stop -n appxxxx

```

>* 当然，您也可以参考删除站点的方式，来使用`id`操作站点停止

## 七、停止站点

>* 如果我们想把停止的站点重新启动，
>* 那我们可以使用启动某个站点服务命令

```shell

ddv start <id|app_name>
ddv start -n <app_name> -i <id>

```

>* 比如我们要启动app_name为`appxxxx`的站点，那我们可以输入


```shell

ddv start appxxxx
ddv start -n appxxxx

```

>* 当然，您也可以参考删除站点的方式，来使用`id`操作站点启动

## 八、停止ddv服务

>* 如果我们想把停止整个ddv的运行，
>* `温馨提示`：
>* 该命令仅仅是关闭ddv的服务进程
>* 并没有彻底关闭整个ddv的`守护线程`
>* 如果您需要杀掉整个`ddv`的进程，可以查考帮助`十二、杀掉ddv整个进程`


```shell

ddv stop

```

## 九、启动ddv服务


```shell

ddv start

```
## 十、重启ddv服务

>*  该操作会导致`整个` `ddv`下的`所有站点`，包括`管理进程`的重启

```shell

ddv restart

```
## 十一、重载配置信息

>* 如果您仅仅是因为更改了配置文件
>* 需要使得被更改的站点生效新的命令
>* 我们可以使用下命令来重载配置文件信息
>* 该命令仅仅会重启被修改配置信息的站点
>* 但是被重启的站点还是会导致在访问的客户的长连接断线

>* 注意，该指令仅仅是重载所以站点，并且重启配置变化的站点而已，其他配置的更改请使用`ddv restart`

```shell

ddv reload

```

## 十二、杀掉ddv整个进程

>* 当您希望关闭整个`ddv`的`所有进程`，包括`守护进程`的时候

```shell

ddv kill

```

## 十三、监听ddv日志尾部变化

>* 这个命令能`监听`到最后的`ddv`日志
>* 这个命令相当于 `ddv tail all`

```shell

ddv tail

```

>* 温馨提示
>* 这个命令实际上是开了两个进程同时监听两个日志文件
>* 所以，可能存在输出日志和错误日志的打印先后顺序问题
>* 如果仅仅需要看错误日志可以选择使用以下命令

```shell

ddv tail error

```

>* 如果仅仅需要看输出错误日志可以选择使用以下命令

```shell

ddv tail log

```

## 十三、监听站点日志尾部变化

>* 比如我们要监听的站点的app_name为`appxxxx`的站点，那我们可以输入

```shell

ddv tail appxxxx all

```

>* 错误日志的命令为

```shell

ddv tail appxxxx error

```

>* 输出日志的命令为

```shell

ddv tail appxxxx log

```

>* 温馨提示
>* 也可以使用`id`的方式选择项目


```shell

ddv tail 1 log

```
