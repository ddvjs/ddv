'use strict';
var uid, username;
//fs模块
const fs = require('fs')
//path模块
const path = require('path');
//cjbbase模块
const cjbbase = require('cjb-base');
//b模块
const b = cjbbase.inherit(cjbbase);
//win权限模块
const getWinAcc = require('../cli/getWinAcc.js');
//系统内核
const platform = process.platform;
//子进程模块
const child_process = require('child_process');
//引入模块
const colors = require('colors/safe');
//日志
const log = require('../log');
//api接口
const Api = require('../api/index.js');
//
const DdvDaemon = require('ddv-worker/daemon');
//指定日志类型
log._process_type = 'D';

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
const config = t;t = void 0;
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
var is_repeat_daemon =false ;
let onEnd = function onEnd(state, err){
  if (process.connected&&process.send&&b.type(process.send, 'function')) {
    try{
      process.send({
        type:'daemon_start_end',
        data:{
          state:state,
          is_repeat_daemon:is_repeat_daemon,
          message:state?'OK':(err.message||'unknow error'),
          stack:state?'':(err.stack||Error('unknow error').stack)
        }
      });
      process.disconnect();
    }catch(e){
      log.error(e);
    }
  }else{
    if (is_repeat_daemon) {
      log.tip('INFO', 'DAEMON_RUN_RES_DAEMON_REPEAT');
    }
    if (state) {
      log.tip(' OK ', 'DAEMON_RUN_RES_DAEMON_SUCCSS');
    }else{
      log.tip('FAIL', 'DAEMON_RUN_RES_DAEMON_FAIL');
      throw err;
    }
  }
};
//定义变量
var q, daemon, api ;
  //创建队列.结束.错误
  q = b.queue().end(onEnd).push(function pingDaemon(next, success){
    //检测后台线程
    api = new Api((err)=>{
      if (err) {
        //没有服务
        next();
      }else{
        //断开服务
        api.disconnect();
        //标示已经有后台程序
        is_repeat_daemon = true ;
        //有在运行后台守护服务，直接结束启动
        success();
      }
      next = success = void 0;
    });
  }, true, function daemonInit(next, success, fail){
    //运行后台守护模块
    //主线程模块
    daemon = new DdvDaemon();
    daemon.lib = Object.create(null);
    daemon.lib.fs = fs;
    daemon.lib.path = path;
    daemon.lib.base = b;
    daemon.lib.getWinAcc = getWinAcc;
    daemon.lib.child_process = child_process;
    daemon.lib.colors = colors;
    daemon.lib.log = log;
    daemon.config = config;
    daemon.serverGuid = config.serverGuid;
    //指向全局模块
    global.daemon = daemon;
    daemon.server = Object.create(null);
    //载入运行模块
    require('./run.js');
    require('./siteManage.js');
    require('./rpcapi.server.js');
    daemon.on('loadend',()=>{
      daemon.init((err)=>{
        if (err) {
          fail(err);
        }else{
          next();
        }
        fail = next = void 0;
      });
    });
  }, true, function daemonApiServerOpen(next, success, fail){
    log.tip('INFO', 'DAEMON_RUN_SERVER_API_START');
    //启动后台守护对外api服务模块
    daemon.server.api.open((err)=>{
      if (err) {
        fail(err);
      }else{
        next();
      }
      fail = next = void 0;
    });
  }, true, function daemonStartEnd(next, success){
    //运行后台守护顺利结束
    success();
  }).run();
