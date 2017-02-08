'use strict'
// 定义进程标题
process.title = 'ddvServerMaster'
// 路径模块
const ddvPath = require('../ddvPath')
// 配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// 获取配置信息
config.getConfig().catch(e => {
  return config
}).then(() => {
  return log.tip('master.wecometip')
}).then(() => {
  return require(ddvPath('master/eventBind'))
}).catch(e => {
  console.error(e)
  process.nextTick(() => {
    process.exit(1)
  })
})
