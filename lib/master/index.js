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
  // 初始化一下，保证能正常日志
  return log.info('master.wecometip')
}).then(() => {
  // 绑定事件
  return require(ddvPath('lib/master/eventBind'))
}).catch(e => {
  console.error('error')
  console.error(e)
  process.nextTick(() => {
    process.exit(1)
  })
})
