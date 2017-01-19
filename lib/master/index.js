'use strict';
//定义进程标题
process.title = 'ddvServerMaster';
//cjb_base模块
const cjb_base = require('cjb-base');
//工具类
const b = cjb_base.inherit(cjb_base) ;
//jsnet模块-主线程管理模块
const master = require('ddv-worker');
const fs = require('fs');
const path = require('path');
const workerWhich = require('./which.js');
const sysInfo = master.sysInfo = b.inherit(null);
//配置参数
const log = require('../log') ;
//指定日志类型
log._process_type = 'M';
//是否开启调试模式
log.DEBUG = false;
//设置语言
log.LOCALE = "EN" ;
//设置语言文件
log.langsFile = 'master.ddv.js' ;

//系统内部配置
const sys = master.__sys_private__ ;


master.on('error',function masterError(e){
	log.tip('ERR ','MASTER_ERROR_WARN');
	log.error(e);
});
master.on('server::listening',function masterError(info){
	log.tip('INFO',['MASTER_SERVER_LISTENING', info&&info.type_port_ip]);
});
master.on('server::close',function masterError(info){
	log.tip('INFO',['MASTER_SERVER_LISTENING_CLOSE', info&&info.type_port_ip]);
});
master.on('server::error',function masterError(e){
	log.tip('ERR ','MASTER_SERVER_ERROR_WARN');
	log.error(e);
	process.exit(1);
});
//主进程启动完毕
master.on('loadend',function masterInit(){
	//获取系统信息
	master.getSysInfo((err)=>{
		if (err) {
			master.emit('error',err);
		}else{
			//服务器启动
			master.serverRun();
			//重新载入站点
			master.reLoadSite();
		}
	});
});
master.on('daemon::call::getSiteInfoOne',function getSiteInfoCb(data, handle, callback){
	var children, siteId, q = b.queue();
		q.end(function onEnd(state, res){
			if (callback&&b.is.function(callback)) {
				if (state) {
					callback(true, res);
				}else{
					callback(false, res.message);
				}
			}
			callback = undefined ;
		});
		q.push(function checkSiteId(next, success, fail){
			if (data&&data.siteId) {
				siteId = data.siteId;
				children = [];
				next();
			}else{
				let err = new Error('not find siteId');
					err.error_id = 'SITE_ID_NOT_FIND';
				fail(err);
			}
			data = handle = next = undefined;
		});
		b.each(((sys&&data&&sys.siteIdToWorkerInfo&&sys.siteIdToWorkerInfo[data.siteId]&&sys.siteIdToWorkerInfo[data.siteId].wids)||[]), function(index, wid) {
				q.push((next, success, fail)=>{
					master.callWorker(wid,'processInfo', function processInfoCb(state, message){
						if (state) {
							message.name = 'w:'+wid;
							//状态
							message.status = message.status||'Stoped';
						}else{
							message = {
								error_stack:message
							};
							//进程内存
							message.memory = '0';
							//状态
							message.status = 'ErrorMast';
							console.log('ErrorMast',message,wid);
						}
						message.isError = state;
						children.push(message);
						next();
						wid = message = undefined ;
					});
				});
				index = undefined ;
		});
		q.push(true, function onEnd(next, success, fail){
			success({children:children});
			callback = undefined ;
		});
		//运行队列
		q.run();

});
//获取进程信息
master.on('worker::call::updateServerConf',function masterInit(site, handle, callback){
	master.loadSite(site);
	callback(true, {});
});
master.on('daemon::call::processInfo',function masterInit(data, handle, callback){
	return callback&&callback(true, {
		pid:process.pid,
		status:'Runing',
		lastUptime:(master.startTimeStamp*1000),
		memoryUsage:process.memoryUsage()
	});
});


//重启站点
master.reLoadSite = function reLoadSite(callback) {
	var lists, q = b.queue();
		q.end(function onEnd() {
			q = void 0;
		}).error(function onError(err){
			master.emit('server::error',err);
			q = void 0;
		}).push((next, success, fail)=>{
			//获取系统信息
			master.getSysInfo((err)=>{
				return q&&(err?fail(err):next());
			});
		}, (next, success, fail)=>{
			//获取站点列表
			master.getSiteLists((err, l)=>{
				if (err) {
					fail(err);
				}else{
					lists = l;
					next();
				}
				err = l = next = fail = void 0;
			});
		}, true, (next, success)=>{
			//添加网站到服务，通过列表数据添加
			b.each(lists, function(index, site) {
				master.loadSite(site);
			});
			success();
			next = success = void 0;
		});
		q.run();
};
//获取站点列表
master.getSiteLists = function getSiteLists(callback) {
	var timer = setTimeout(function() {
		if (b.type(callback, 'function')) {
			callback(master.makeError('GET_SITE_LISTS_ERROR', new Error('get the site list timeout')), null);
		}
		callback = timer = void 0;
	}, 1000*50);
	//调用守护进程获取站点列表
	master.callDaemon('getSiteLists', {}, function getSiteListsCb(state, message){
		if (b.type(callback, 'function')) {
			if (state===true) {
				b.each(message, function(index, site) {
					site.logOutput = site.logOutput || path.join(site.path, 'log/output.log');
					site.logError = site.logError || path.join(site.path, 'log/error.log');
					site.logAll = site.logAll || path.join(site.path, 'log/all.log');
					try{
						let workerParse = workerWhich(site.path);
						site.workerFile = site.workerFile || workerParse.file;
						site.workerArgs = site.workerArgs || workerParse.args;
						site.workerOptions = site.workerOptions || workerParse.options;
					}catch(e){
						console.log(site,e);
						return;
					}
				});
				callback(null, message);
			}else{
				callback(master.makeError('GET_SITE_LISTS_ERROR', new Error(message)), null);
			}
		}
		if (timer) {
			clearTimeout(timer);
		}
		callback = timer = message = state = void 0;
	});
};

//获取系统信息
master.getSysInfo = function getSysInfo(callback){
	var timer = setTimeout(function() {
		if (b.type(callback, 'function')) {
			callback(master.makeError('GET_SYS_INFO_TIMEOUT', new Error('get the sys info timeout')), null);
		}
		callback = timer = void 0;
	}, 1000*50);
	master.callDaemon('getSysInfo', {}, function getSysInfoCb(state, message){
		if (state===true) {
			b.each(sysInfo, function(key) {
				delete sysInfo[key];
			});
			b.extend(true, sysInfo, message);
			//设置语言
			log.LOCALE = sysInfo.locale ;
		}
		if (b.type(callback, 'function')) {
			if (state===true) {
				callback(null, sysInfo);
			}else{
				callback(master.makeError('GET_SYS_INFO_ERROR', new Error(message)), null);
			}
		}
		if (timer) {
			clearTimeout(timer);
		}
		callback = timer = message = state = void 0;
	});
};
//制造错误
master.makeError = function makeError(error_id, e){
	if (e) {
		if (!b.type(e, 'error')) {
			if (!b.type(e, 'string')) {
				e = new Error(e);
			}else if (b.type(e, 'object')) {
				if (!e.stack) {
					e = b.extend(true, (new Error('Unknow Error')), e);
				}
			}else{
				e = new Error('Unknow Error');
			}
		}
	}else{
		e = new Error('Unknow Error');
	}
	e.error_id = e.error_id || error_id;
	error_id = void 0;
	return e ;
};
