'use strict'
module.exports = function configFn (path, ddvConfigPath) {
  var cst = {
    // 默认
    DEFAULT_PID_PATH: path.join(ddvConfigPath, 'pids'),
    // 配置文件
    DDV_SITE_FILE: process.env.DDV_SITE_FILE || path.join(ddvConfigPath, 'sites.js'),
    // 守护进程正常日志
    DDV_OUT_LOG_FILE_PATH: process.env.DDV_OUT_LOG_FILE_PATH || path.join(ddvConfigPath, 'out.ddv.log'),
    // 守护进程错误日志
    DDV_ERR_LOG_FILE_PATH: process.env.DDV_ERR_LOG_FILE_PATH || path.join(ddvConfigPath, 'err.ddv.log'),
    // 守护进程的pid
    DDV_PID_FILE_PATH: process.env.DDV_PID_FILE_PATH || path.join(ddvConfigPath, 'daemon.ddv.pid'),
    // 守护进程直接通讯管道
    DDV_DAEMON_RPC_PORT: process.env.DDV_DAEMON_RPC_PORT || path.join(ddvConfigPath, 'daemon.rpc.sock'),
    // 守护进程通讯超时
    DAEMON_PRC_TIMEOUT: process.env.DDV_DAEMON_PRC_TIMEOUT || (16 * 1000),
    // 杀掉守护进程超时
    KILL_DAEMON_TIMEOUT: process.env.KILL_DAEMON_TIMEOUT || (20 * 1000),
    // 杀掉管理进程超时
    KILL_MASTER_TIMEOUT: process.env.KILL_MASTER_TIMEOUT || (20 * 1000),
    // 杀掉管理进程超时
    KILL_WORKER_TIMEOUT: process.env.KILL_WORKER_TIMEOUT || (20 * 1000),

    // 成功退出的状态码
    SUCCESS_EXIT: 0,
    // 错误退出的状态码
    ERROR_EXIT: 1,
    // 异常
    CODE_UNCAUGHTEXCEPTION: 100,

    // 日志时间格式
    DDV_LOG_DATE_FORMAT: process.env.DDV_LOG_DATE_FORMAT || 'YYYY-MM-DD HH:mm:ss'

  }

  return cst
}
