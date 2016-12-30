'use strict';
//ddv作为telnet工具使用
//标题
process.title = 'ddvCli';
var uid, username;
if(process.argv&&process.argv.length>1&&process.argv[2]==='telnet'){
	require('../telnetCli');
	return ;
}
//path模块
const path = require('path');
//cjbbase模块
const b = require('cjb-base');
//win权限模块
const getWinAcc = require('./getWinAcc.js');
//系统内核
const platform = process.platform;
//子进程模块
const child_process = require('child_process');
//引入模块
const colors = require('colors/safe');
//日志
const log = require('../log');
//parseCli
const parseCli = require('./parseCli.js');
//daemonSatan
const daemonSatan = require('../daemon/satan.js');
//指定日志类型
log._process_type = 'CLI';


if (!uid) {
	uid = b.type(process.getuid, 'function')&&process.getuid()||0 ;
}
//如果没有拿到 用户名，尝试通过 whoami 命令行获取
if (!username) {
	//运行一条通用命令拿到用户名
	try{
		username = child_process.execSync('whoami');
		username = username&&username.length>0?username.toString().trim():'';
	}catch(e){}
}

//如果没有拿到 用户名，尝试通过 id -un 命令行获取
if (!username) {
	//运行一条通用命令拿到用户名
	try{
		username = child_process.execSync('id -un');
		username = username&&username.length>0?username.toString().trim():'';
	}catch(e){}
}
//定义几个局部变量
var t, configErr, isRootAcc, winRunAcc, notAdminAccTip;
//是否有观看权限
isRootAcc = false;
//windows运行权限
winRunAcc = 'guest';
try{
	t = require('../config');
}catch(err){
	t = {};
	configErr = err;
}
//赋值到config
const config = t;
t = void 0;
//根据系统判断
switch (platform) {
	//win内核
	case 'win32':
	case 'win64':
		winRunAcc = getWinAcc();
		isRootAcc = ['protected','system','high'].indexOf(winRunAcc)>-1;
		notAdminAccTip = colors.red('Use the super administrator to run the command line！');
	break;
	default:
		isRootAcc = Boolean(uid.toString()==='0');
		notAdminAccTip = colors.red('Use sudo to run the command line！');
		notAdminAccTip +='\r\n'+ colors.red.bold('sudo '+process.argv.join(' '));
	break;
}
//判断是否拿到错误信息
if (configErr) {
	if (!isRootAcc) {
		console.error(notAdminAccTip);
	}
	console.error(configErr);
	return ;
}
//是否开启调试模式
log.DEBUG = config.DEBUG||false;
//设置语言
log.LOCALE = config.locale ;
//设置语言文件
log.langsFile = 'daemon.ddv.js' ;
//判断是否已经安装过
if (config.isStartupInit!==true) {
	//如果没有权限
	if (!isRootAcc) {
		//提示没有权限，并且退出
		console.error(notAdminAccTip);
		//直接错误退出
		process.exit(1);
		//
		return ;
	}
	//提示尝试加入后台服务
	log.tip('INFO', 'CLI_STARTUP_TRY_INIT');
	//载入安装模块
	let startupInit = require('./startupInit.js');
	//运行安装模块
	if(!startupInit.run(config, log, username)){
		//直接错误退出
		process.exit(1);
		return ;
	}
	log.tip('INFO', 'CLI_STARTUP_TRY_SUCCESS');
}

daemonSatan.setConfig(config);
daemonSatan.setUserName(username);
parseCli.setLog(log);
//设置获取api方法
parseCli.setStartDaemon(function startDaemon(getCallback){
	let q ;
	q = b.queue();
	q.end(function onEnd(state, res) {
		if (getCallback&&b.type(getCallback, 'function')) {
			getCallback(state?null:res);
		}
		q = void 0 ;
	});
	q.push(function pingDaemon(next, success) {
		daemonSatan.pingDaemon((err, pid)=>{
			if (err) {
				next();
			}else{
				success();
			}
			next = success = void 0;
		});
	});
	q.push(true, function checkIsRootAcc(next, success, fail) {
		//如果没有权限
		if (isRootAcc) {
			//尝试启动服务
			log.tip('INFO', 'CLI_STARTUP_DAEMON_TRY_RUN');
			//启动守护线程
			daemonSatan.start((err)=>{
				if (err) {
					fail(err);
				}else{
					next();
				}
				fail = next = void 0;
			});
		}else{
			//提示没有权限，并且退出
			console.error(notAdminAccTip);
			//直接错误退出
			process.exit(1);
			//
			return ;
		}
	});
	q.push(true, function checkStartDaemonState(next, success, fail) {
		daemonSatan.pingDaemon((err, pid)=>{
			if (err) {
				fail(err);
			}else{
				success(err);
			}
			fail = success = void 0;
		});
	});
	//运行队列
	q.run();
});
//解析命令行
parseCli(process.argv);
