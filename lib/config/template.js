'use strict';
module.exports = function configFn(path, ddvHomePath) {
	var cst = {
		//默认
		DEFAULT_PID_PATH         : path.join(ddvHomePath, 'pids'),
		//配置文件
		DDV_SITE_FILE            : path.join(ddvHomePath, 'sites.js'),
		//守护进程正常日志
		DDV_OUT_LOG_FILE_PATH    : path.join(ddvHomePath, 'out.ddv.log'),
		//守护进程错误日志
		DDV_ERR_LOG_FILE_PATH    : path.join(ddvHomePath, 'err.ddv.log'),
		//守护进程的pid
		DDV_PID_FILE_PATH        : path.join(ddvHomePath, 'daemon.ddv.pid'),
		//守护进程直接通讯管道
		DDV_DAEMON_RPC_PORT      : path.join(ddvHomePath, 'daemon.rpc.sock'),
		//守护进程通讯超时
		DAEMON_PRC_TIMEOUT       : process.env.DDV_DAEMON_PRC_TIMEOUT || (16*1000),


		//成功退出的状态码
		SUCCESS_EXIT           : 0,
		//错误退出的状态码
		ERROR_EXIT             : 1,
		//异常
		CODE_UNCAUGHTEXCEPTION   : 100,

		//日志时间格式
		DDV_LOG_DATE_FORMAT      : process.env.DDV_LOG_DATE_FORMAT !== undefined ? process.env.DDV_LOG_DATE_FORMAT : 'YYYY-MM-DD HH:mm:ss'

	};

	return cst;
};
