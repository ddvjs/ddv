'use strict'
const fs = require('fs')
const path = require('path')
const b = require('cjb-base')
const constants = Object.create(null)
const template = require('./template.js')
const scripts = path.resolve(__dirname, '../scripts')
constants.getSaveData = function (cst, ddvHomePath) {
  var isExists = false
  try {
    let stat = fs.statSync(cst.DDV_CONF_FILE)
    isExists = Boolean(stat.isFile())
  } catch (e) {}
  if (isExists) {
    // 读取
    let template = require(cst.DDV_CONF_FILE)
    if (template && b.type(template, 'function')) {
      // 合并
      b.extend.call(cst, true, cst, template(path, ddvHomePath))
    } else {
      let data = fs.readFileSync(path.resolve(__dirname, './template.js'))
      fs.writeFileSync(cst.DDV_CONF_FILE, data)
    }
  } else {
    let data = fs.readFileSync(path.resolve(__dirname, './template.js'))
    fs.writeFileSync(cst.DDV_CONF_FILE, data)
  }
}
constants.base = function (cst, ddvHomePath) {
  b.extend.call(cst, true, cst, {
    // 配置文件
    DDV_CONF_FILE: path.join(ddvHomePath, 'conf.js'),
    DDV_CMD_LOGO: path.resolve(scripts, './ddv-cmd-logo.js')
  }, template(path, ddvHomePath))
}
constants.startup = function (cst, ddvHomePath) {
  b.extend.call(cst, true, cst, {
    /** ***************主流系统的启动脚本*****************/
    CENTOS_STARTUP_SCRIPT: path.resolve(scripts, './ddv-init-centos.sh'),
    UBUNTU_STARTUP_SCRIPT: path.resolve(scripts, './ddv-init.sh'),
    SYSTEMD_STARTUP_SCRIPT: path.resolve(scripts, './ddv.service'),
    AMAZON_STARTUP_SCRIPT: path.resolve(scripts, './ddv-init-amazon.sh'),
    GENTOO_STARTUP_SCRIPT: path.resolve(scripts, './ddv'),
    DARWIN_STARTUP_SCRIPT: path.resolve(scripts, './so.cjb.ddv.plist'),
    FREEBSD_STARTUP_SCRIPT: path.resolve(scripts, './ddv-freebsd.sh'),
    /** ***************主流系统的启动脚本*****************/

    LOGROTATE_SCRIPT: path.resolve(scripts, './logrotate.d/ddv')
  }, template(path, ddvHomePath))
}
module.exports = function constantsExportsInit (config) {
  const cst = Object.create(null)
  // 获取基本的配置
  constants.base(cst, config.ddvHomePath)
  // 获取startup的配置
  constants.startup(cst, config.ddvHomePath)
  // 获取存储的配置
  constants.getSaveData(cst, config.ddvHomePath)

  // Windows专用
  if (config.platform === 'win32' || config.platform === 'win64') {
    cst.DDV_DAEMON_RPC_PORT = '\\\\.\\pipe\\daemon.rpc.ddv.sock'
  }
  // 最终出口
  return cst
}
