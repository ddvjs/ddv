'use strict'
const fs = require('fs')
const path = require('path')
const util = require('ddv-worker/util')
const template = require('./template.js')
const scripts = path.resolve(__dirname, '../scripts')
module.exports = function getConstantsPromise (config) {
  return Promise.resolve(getConstants(config))
}
function getConstants (config) {
  const cst = Object.create(null)
  // 获取基本的配置
  base(cst, config.ddvConfigPath)
  // 获取startup的配置
  startup(cst, config.ddvConfigPath)
  // 获取存储的配置
  getSaveData(cst, config.ddvConfigPath)

  // Windows专用
  if (config.platformByNode === 'win32' || config.platformByNode === 'win64') {
    cst.DDV_DAEMON_RPC_PORT = process.env.DDV_DAEMON_RPC_PORT || '\\\\.\\pipe\\daemon.rpc.ddv.sock'
  }
  // 最终出口
  return cst
}
function getSaveData (cst, ddvConfigPath) {
  var isExists = false
  try {
    let stat = fs.statSync(cst.DDV_CONSTANTS_FILE)
    isExists = Boolean(stat.isFile())
  } catch (e) {}
  if (isExists) {
    // 读取
    let template = require(cst.DDV_CONSTANTS_FILE)
    if (template && util.type(template, 'function')) {
      // 合并
      util.extend.call(cst, true, cst, template(path, ddvConfigPath))
    } else {
      let data = fs.readFileSync(path.resolve(__dirname, './template.js'))
      fs.writeFileSync(cst.DDV_CONSTANTS_FILE, data)
    }
  } else {
    let data = fs.readFileSync(path.resolve(__dirname, './template.js'))
    fs.writeFileSync(cst.DDV_CONSTANTS_FILE, data)
  }
}
function base (cst, ddvConfigPath) {
  util.extend.call(cst, true, cst, {
    // 配置文件
    DDV_CONSTANTS_FILE: path.join(ddvConfigPath, 'constants.js'),
    DDV_CMD_LOGO: path.resolve(scripts, './ddv-cmd-logo.js')
  }, template(path, ddvConfigPath))
}
function startup (cst, ddvConfigPath) {
  util.extend.call(cst, true, cst, {
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
  }, template(path, ddvConfigPath))
}
