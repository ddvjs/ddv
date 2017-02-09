'use strict'
// ddv日志模块
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// 终止符号
const EOL = require('os').EOL
// 监听模块
const Tail = require('tail').Tail
// 子进程模块
const childProcess = require('child_process')
// 输出
const stdoutWrite = (data, isAppendEOL) => {
// 输出数据
  process.stdout.write(data)
  if (isAppendEOL) {
    // 输出换行
    process.stdout.write(EOL)
  }
}
module.exports = function cmdTailSite (siteName, type) {
  config
  log
  Tail
  childProcess
  stdoutWrite
}
