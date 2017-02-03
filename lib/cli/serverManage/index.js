'use strict'
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
/**
 * 开启服务进程
 */
commander
.command('start')
.description(log.t('cli.help.command.start.server'))
.action(function start () { commander.rpcBySiteIdName('start') })
/**
* 重启服务进程
*/
commander
.command('restart')
.description('Restart ddv server or restart site')
.description(log.t('cli.help.command.restart.server'))
.action(function restart () { commander.rpcBySiteIdName('restart') })
/**
* 重启服务进程
*/
commander
.command('reload')
.description(log.t('cli.help.command.reload.server'))
.action(function reload () { commander.rpcBySiteIdName('reload') })
/**
* 停止服务进程
*/
commander
.command('stop')
.description(log.t('cli.help.command.stop.server'))
.action(function stop () { commander.rpcBySiteIdName('stop') })
/**
* 重启后
*/
commander
.command('resurrect')
.description(log.t('cli.help.command.resurrect'))
.action(function () {
  console.log('重启了')
})
