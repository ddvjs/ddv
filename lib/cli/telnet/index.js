'use strict'
// 标题
process.title = 'ddvTelnetCli'
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))

log.show('开发中...')

console.log(config)
