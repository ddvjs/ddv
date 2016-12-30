'use strict';
const daemon = global.daemon || null ;
if (!daemon) {
	throw new Error('daemon为空');
}
const path = daemon.lib.path;
const cjbbase = daemon.lib.base;
const b = cjbbase.inherit(cjbbase);
const getWinAcc = daemon.lib.getWinAcc;
const log = daemon.lib.log;
const config = daemon.config;
//标题
process.title = 'ddv v'+config.version+': Daemon God';
daemon.init = function daemonInit(callback=function(){}) {
	var q;
	//创建队列
	q = b.queue();
	//结束
	q.end(function onEnd(state, res){
		if (q&&callback&&b.type(callback, 'function')) {
			if (state) {
				callback(null);
			}else{
				callback(res);
			}
		}
		q = callback = void 0;
	});
	//初始化
	q.push(function (next){
		next();
	});
	//关闭事件绑定
	q.push(true, function closeEventBind(next){
		//绑定关闭事件
		daemon.closeEventInit();
		next();
	});
	q.push(true, function masterInit(next, success){
		//关闭事件初始化
		daemon.masterInit();
		//完毕
		success();
	});
	//运行队列
	q.run();
};
//启动主管理线程
daemon.masterInit = function(){
	//设置管理线程启动文件
	daemon.setMasterFile(path.resolve(__dirname,'../master/index.js'));
	//运行服务器
	daemon.run();
};
//关闭事件初始化
daemon.closeEventInit = function(){
	//监听异常
	process.on('uncaughtException', function () {
		return daemon.uncaughtException.apply(daemon,arguments);
	});
	//监听结束
	process.on('beforeExit', function () {
		return daemon.closeEvent.apply(daemon,['beforeExit'].concat(b.argsToArray(arguments)));
	});
	//监听结束
	process.on('exit', function () {
		return daemon.closeEvent.apply(daemon,['exit'].concat(b.argsToArray(arguments)));
	});
	//终止进程-软件终止信号
	//SIGTERM是杀或的killall命令发送到进程默认的信号。
	//它会导致一过程的终止，但是SIGKILL信号不同，它可以被捕获和解释（或忽略）的过程。
	//因此，SIGTERM类似于问一个进程终止可好，让清理文件和关闭。
	//因为这个原因，许多Unix系统关机期间，
	//初始化问题SIGTERM到所有非必要的断电过程中，等待几秒钟，
	//然后发出SIGKILL强行终止仍然存在任何这样的过程。
	process.on('SIGTERM', function () {
		return daemon.closeEvent.apply(daemon,['SIGTERM'].concat(b.argsToArray(arguments)));
	});
	//终止进程-中断进程  通常是Ctrl-C
	process.on('SIGINT', function () {
		return daemon.closeEvent.apply(daemon,['SIGINT'].concat(b.argsToArray(arguments)));
	});
	//终止进程-中断进程  通常是Ctrl-\
	//和SIGINT类似, 但由QUIT字符(通常是Ctrl-\)来控制. 进程在因收到SIGQUIT退出时会产生core文件, 在这个意义上类似于一个程序错误信号
	process.on('SIGQUIT', function () {
		return daemon.closeEvent.apply(daemon,['SIGQUIT'].concat(b.argsToArray(arguments)));
	});
	//SIGHUP SIGHUP SIGHUP SIGHUP
	process.on('SIGHUP', function () {
		return daemon.closeEvent.apply(daemon,['SIGHUP'].concat(b.argsToArray(arguments)));
	});
	//上符合POSIX平台上，SIGKILL是发送到处理的信号以使其立即终止。
	//当发送到程序，SIGKILL使其立即终止。
	//在对比SIGTERM和SIGINT，这个信号不能被捕获或忽略，并且在接收过程中不能执行任何清理在接收到该信号。
	process.on('SIGILL', function() {
		if (global.gc && typeof global.gc === 'function') {
			try {
				global.gc();
			} catch (e) {}
		}
	});
};
//守护线程异常了
daemon.uncaughtException = function(err){
	log.error(err);
};
//守护线程将要关闭了
daemon.closeEvent = function(type){
	log.tip('INFO', ['DAEMON_RUN_EXIT_EVENT_TIP',(type||'UNKNOWN_EXIT')]);
	daemon.closeEventRun();
};
//守护线程将要关闭
daemon.closeEventRun = function(type){
	if (daemon.is_closeing === true) {
		return ;
	}else{
		daemon.is_closeing = true;
	}
	try{
		daemon.server.api.close();
	} catch (e) {}
	process.exit(0);
};

daemon._getsiteIdsNames = function(data){
	var t = {
			names : [],
			siteIds : []
		};
	if (data.siteIds) {
		if (!b.is.array(data.siteIds)) {
			data.siteIds = data.siteIds.toString().split(',');
		}
		b.each(data.siteIds, function(index, siteId) {
			if (siteId) {
				t.siteIds.push(siteId);
			}
			index =	siteId = undefined ;
		});
	}
	if (data.names) {
		if (!b.is.array(data.names)) {
			data.names = data.names.toString().split(',');
		}
		b.each(data.names, function(index, name) {
			if (name) {
				t.names.push(name);
			}
			index =	name = undefined ;
		});
	}
	data = undefined ;
	return t;
};
daemon.stopRun = function(data, callback){
	var t = daemon._getsiteIdsNames(data);
	if (t.siteIds.length>0||t.names.length>0) {
		console.log('停止siteIds',t);

	}else{
		daemon.stop(callback);
	}
};
daemon.startRun = function(data, callback){
	var t = daemon._getsiteIdsNames(data);
	if (t.siteIds.length>0||t.names.length>0) {
		console.log('startRunsiteIds',t);

	}else{
		daemon.start(callback);
	}
};
daemon.restartRun = function(data, callback){
	var t = daemon._getsiteIdsNames(data);
	if (t.siteIds.length>0||t.names.length>0) {
		console.log('restartRunsiteIds',t);

	}else{
		daemon.restart(callback);
	}
};


daemon.getSiteInfoByLists = function(lists, callback){
	var q ;
		q = b.queue();
		b.each(lists, function siteOne(siteId, site) {
			site.name = site.name || site.path ;
			site.siteId = site.siteId || siteId ;
			site.children = [];
			if (site.siteId!='-') {
				q.push(function getSiteInfoOne(next) {
					daemon.callMaster('getSiteInfoOne',{
						siteId:this.siteId
					}, (state, message, handle)=>{
						if(state){
							if (message&&message.children&&b.is.array(message.children)) {
								let [i, len] = [0, message.children.length||0];
								for (; i < len; i++) {
									let children = message.children[i];
									if (!children) {continue;}
									//站点id
									children.siteId = (children.siteId==void 0)?children.siteId:this.siteId;
									//状态
									children.status = children.status || this.status || 'Stoped';
									//最后更新时间
									children.lastUptime = b.is.number(children.lastUptime)?children.lastUptime:(this.lastUptime||b.now());
									//调试
									children.debug = children.debug || 'Unknow';
									//内存
									children.memory = children&&children.memoryUsage&&children.memoryUsage.heapTotal||'0';
									this.children.push(children);
									children = undefined ;
								}
								this.restart = message.restart||0;
							}
						}else{
							this.error_stack = message ;
							this.restart = this.restart || 0;
						}
						//错误状态
						this.isError = state ;
						next();
						//回收
						next = state = message = handle = void 0 ;
					});
				}.bind(site));
			}
			site = siteId = void 0;
		});
		q.push(true, function end(){
			if (callback&&b.is.function(callback)) {
				callback();
			}
			callback = undefined ;
		});
		lists = undefined ;
		//运行队列
		q.run();
};



//master 向该线程[守护线程] 获取系统信息
daemon.on('master::call::getSysInfo',function getSysInfo(data, handle, callback){
	callback(true, {
		//npm配置文件
		pkg:config.pkg,
		//目录
		dir:config.dir,
		//ddv版本
		version:config.version,
		//语言环境
		locale:config.locale,
		//当前程序启动目录
		cwd:config.cwd,
		//当前运行的cpu架构
		arch:config.arch,
		//系统内核
		platform:config.platform,
		//成功退出
		SUCCESS_EXIT:config.SUCCESS_EXIT,
		//成功退出
		ERROR_EXIT:config.ERROR_EXIT,
		//异常突出code
		CODE_UNCAUGHTEXCEPTION:config.CODE_UNCAUGHTEXCEPTION
	});
});
//master 向该线程[守护线程] 获取站点列表信息
daemon.on('master::call::getSiteLists',function getSiteLists(data, handle, callback){
	daemon.siteManage.lists(function listsCb(e, lists){
		callback(true, lists);
	});
});
