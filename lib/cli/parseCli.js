'use strict';
var startDaemon, log;
//配置参数
const config = require('../config/index.js') ;
//commander 模块
const c = require('commander');
//path 模块
const path = require('path');
//colors 模块
const colors = require('colors');
//child_process 模块
const child_process = require('child_process');
//Api模块
const Api = require('../api/index.js');
//cjbbase模块
const b = require('cjb-base');
//解析命令
const parseCli = module.exports = function parseCli(argv) {
	c.argv_source = argv;
	if ((!argv)||argv.length <= 2) {
		argv = argv || process.argv.slice(0,2);
		//解析命令行输入
		c.parse(argv);
		//输出帮助
		c.outputHelp();
		//退出
		process.exit(1);
	}else{
		c.parse(argv);
	}
};
//设置
parseCli.setStartDaemon = function(fn){
	startDaemon = fn ;
};
//设置
parseCli.setLog = function(l){
	log = l ;
};

//获取语言包数据
const langs = (((locale)=>{
	locale = locale||'EN';
	let langs ;
	try{
		langs = require('../language' + path.sep + locale + path.sep + 'parseCli.ddv.js')(colors);
	}catch(e){
		langs = require('../language' + path.sep + 'EN' + path.sep + 'parseCli.ddv.js')(colors);
	}
	return langs;
})(config.locale)) ;

if (process.argv[process.argv.length-1]=='help' &&
	process.argv.length>1) {
	process.argv.push('--help');
}
if (process.argv[process.argv.length-1]=='/?' &&
	process.argv.length>1) {
	process.argv.push('--help');
}

//设定版本号
c._version = config.version;
//使用格式
c.usage('[cmd] siteId');
//获取版本
c.option('-v, --version', langs.OPTION_DESCRIPTION_VERSION);
c.option('--debug', langs.OPTION_DESCRIPTION_DEBUG, false);
c.option('-n, --name <name>', langs.OPTION_DESCRIPTION_SITE_NAME, null);
c.option('-i, --siteId <siteId>', langs.OPTION_DESCRIPTION_SITE_ID, null);
c.option('--no-run-daemon', langs.OPTION_DESCRIPTION_NO_RUN_DAEMON, false);

//隐藏输出内容
c.option('-s, --silent', langs.OPTION_DESCRIPTION_SILENT, false);

//输出帮助
c.Command.prototype.optionHelp = function() {
	var width = this.largestOptionLength();
	return [tool.pad('--help', width) + '  ' + langs.OPTION_DESCRIPTION_HELP]
		.concat(this.options.map(function(option) {
		  return tool.pad(option.flags, width) + '  ' + option.description;
		}))
		.join('\n');
};

//帮助信息基本例子输出
c.on('--help', function() {
	let p = '    ';
	log.show('  Basic Examples:');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_ADD_SITE+' :');
	log.show(p+'$ ddv add ./app_dir');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_ADD_SITEAND_NAME+' :');
	log.show(p+'$ ddv add ./app_dir -n "app_name"');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_REMOVE_SITE_BY_ID+' :');
	log.show(p+'$ ddv remove [siteId]');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_REMOVE_SITE_BY_NAME+' :');
	log.show(p+'$ ddv remove [app_name]');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_START_DDV_SERVER+' :');
	log.show(p+'$ ddv start');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_RESTART_DDV_SERVER+' :');
	log.show(p+'$ ddv restart');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_RELOAD_DDV_SERVER+' :');
	log.show(p+'$ ddv reload');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_STOP_DDV_SERVER+' :');
	log.show(p+'$ ddv stop');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_KILL_DDV_SERVER+' :');
	log.show(p+'$ ddv kill');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_UPDATE_DDV_SERVER+' :');
	log.show(p+'$ npm install ddv@latest -g ; ddv update');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_ADD_SITE_HELP+' :');
	log.show(p+'$ ddv help add');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_REMOVE_SITE_HELP+' :');
	log.show(p+'$ ddv help remove');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_MORE_HELP+' :');
	log.show(p+'$ ddv help [command]');
	log.show('');
	log.show(p+langs.HELP_EXAMPLES_SHOW_MORE_EXAMPLES_IN+' https://github.com/chengjiabao/ddv#usagefeatures');
	log.show('');
	log.show('');
});


/**
 * 添加站点
 */
c
.command('add <file|path>')
.option('-n, --name <name>', 'set a <name> for site')
.description(langs.COMMAND_ADD_AN_SITE_AND_SITEAND_NAME)
.action(function(path) {
	c.__api('add', c._cmdGetPathName(path, c.name),function callback(e, res){
		if (e) {
			log.tip('FAIL','CLI_COMMAND_ADD_STIE_FAIL');
			console.error(colors.grey(e.message));
			console.error('');
			console.error(e);
			c.__disconnect();
		}else{
			log.tip(' OK ','CLI_COMMAND_ADD_STIE_SUCCESS');
	 		//显示列表
	 		c._cmdLists();
		}
	});
	path = undefined;
});

//移除
c
.command('remove [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2', '')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', -1)
.description(langs.COMMAND_REMOVE_AN_SITE)
.action(function remove(){ c._cmdFnBySiteIdName.call(c, 'remove'); });
//移除 remove的别名
c
.command('delete [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2','')
.description(langs.COMMAND_REMOVE_ALIAS_AN_SITE)
.action(function remove(){ c._cmdFnBySiteIdName.call(c, 'remove'); });
//移除 remove的别名
c
.command('del [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2','')
.description(langs.COMMAND_REMOVE_ALIAS_AN_SITE)
.action(function remove(){ c._cmdFnBySiteIdName.call(c, 'remove'); });

/**
 * 开启服务进程
 */
c
.command('start [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2','')
.description(langs.COMMAND_START)
.action(function start(){ c._cmdFnBySiteIdName.call(c, 'start'); });
/**
* 重启服务进程
*/
c
.command('restart [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2','')
.description('Restart ddv server or restart site')
.description(langs.COMMAND_RESTART)
.action(function restart(){ c._cmdFnBySiteIdName.call(c, 'restart'); });
/**
* 重启服务进程
*/
c
.command('reload')
.description(langs.COMMAND_RELOAD)
.action(function reload(){ c._cmdFnBySiteIdName.call(c, 'reload'); });
/**
* 停止服务进程
*/
c
.command('stop [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2','')
.description(langs.COMMAND_STOP)
.action(function stop(){ c._cmdFnBySiteIdName.call(c, 'stop'); });



/**
 * 列出站点和当前的站点状态
 */
c
.command('lists')
.description(langs.COMMAND_LISTS)
.action(function() {
	c._cmdLists();
});
c
.command('list')
.description(langs.COMMAND_LISTS_ALIAS)
.action(function() {
	c._cmdLists();
});

c
.command('ls')
.description(langs.COMMAND_LISTS_ALIAS)
.action(function() {
	c._cmdLists();
});

c
.command('l')
.description(langs.COMMAND_LISTS_ALIAS)
.action(function() {
	c._cmdLists();
});

c
.command('status')
.description(langs.COMMAND_LISTS_ALIAS)
.action(function() {
	c._cmdLists();
});
//返回的JSON
c
.command('jlist')
.description(langs.COMMAND_LISTS_JSON)
.action(function() {
	c._cmdLists(true);
});
//返回格式化好的JSON
c
.command('prettylist')
.description(langs.COMMAND_LISTS_JSON_PRETTIFIED)
 .action(function() {
	c._cmdLists(true, true);
});

/**
 * 杀掉守护进程
 */
c
.command('kill')
.option('-p --pid <pid>', 'kill pid')
.description(langs.COMMAND_KILL_DAEMON_DDV)
.action(function() {
	c.__api(true, 'kill', {
		'pid':c.pid
	},function callback(e, res){
		if (e) {
			console.log('kill-结果失败', e);
		}else{
	 		let [colAligns, head, Table, table, t] = [[], [], require('cli-table2')];
			// 实例
			b.each(res, function(index, pidt) {
				t = [];
				b.each(pidt, function(name, value) {
					if (!table) {
						head[head.length] = name;
						colAligns[colAligns.length] = 'center';
					}
					t.push(value);
				});
				if (!table) {
					table = new Table({
						head:       head,
						colAligns : colAligns,
						style :     {'padding-left' : 1, head : ['cyan', 'bold'], compact : true}
					});
					head = colAligns = undefined ;
				}
				table.push(t);
				t = undefined ;
			});
 			console.log('kill-结果成功');
 			if (table) {
 				console.log(table.toString());
 			}
 			table = head = colAligns = undefined ;
		}
	});
});

//重启后
c
.command('resurrect')
.description(langs.COMMAND_RESURRECT)
.action(function() {

	console.log('重启了');
});


/**
 * 监听文件末尾变化
 */
c
.command('tail [site_name] [error|log|all]')
.description(langs.COMMAND_TAIL)
.action(function(tailType, logType) {
	if ((logType==void 0)&&b.type(tailType, 'string')&&(['all', 'log', 'err', 'error'].indexOf(tailType)>-1)) {
		c._cmdTailDdv(tailType);
	}else if((tailType==void 0)&&(logType==void 0)){
		c._cmdTailDdv('all');
	}else if(tailType!=(void 0)&&tailType.length>0){
		console.log('暂时不支持监听站点');
	}else{
		//输出帮助
		c.parse([c.argv_source[0], c.argv_source[1], 'tail', '--help']);
	}
});

/**
 * 监听文件末尾变化
 */
c
.command('guid [setGuid]')
.description(langs.COMMAND_TAIL)
.action(function(setGuid) {
	c.__api('guid', {set_guid:(setGuid==void 0?null:setGuid)},(err, res)=>{
		let logkey  = 'CLI_COMMAND_GUID_'+(setGuid?'SET_':'GET_');
			//加入成功失败
			logkey += err?'FAIL':'SUCCESS';
			//提示结果
			log.tip((err?'ERR ':' OK '), logkey);
		if (err) {
			console.error(colors.grey(err.message));
			console.error('');
		}else{
			log.tip((err?'ERR ':' OK '), ['CLI_COMMAND_GUID_TIP',res.guid]);
		}
		c.__disconnect();
		logkey = void 0;
	});
});


/**
 * 详细帮助
 */
c
.command('help')
.description(langs.COMMAND_HELP)
.action(function(command) {
	if (arguments.length==1) {
		c.outputHelp();
	}else{
		c.parse([c.argv_source[0], c.argv_source[1], command, '--help']);
	}
});
/**
 * 其他
 */
c
.command('*')
.action(function() {
	log.tip('ERR ',['CLI_COMMAND_NOT_FOUND', ('[ddv '+ c.argv_source.slice(2).join(' ') + ']')]);
	c.outputHelp();
	process.exit(config.ERROR_EXIT);
});
//监听ddv模块
c._cmdTailDdv = function(type){
	type = (type || 'all').toLowerCase();
	if (['log', 'err', 'error', 'all'].indexOf(type)<0) {
		log.tip('ERR','CLI_LISTEN_LOG_TAIL_DDV_TAIL_SUPPORTED');
		c.parse([c.argv_source[0], c.argv_source[1], 'tail', '--help']);
		return;
	}
	let Type = type.substring(0,1).toUpperCase( ) + type.substring(1);
	//重新定义命令行标题
	process.title = 'ddvCliTail' + Type;

	let EOL = require('os').EOL;

	let options= {
		separator: /[\r]{0,1}\n/,
		fromBeginning: false,
		fsWatchOptions: {},
		follow: false,
		//使用文件监听模块
		useWatchFile:true
	};
	//监听模块
	let Tail = require('tail').Tail;
	//监听的输出日志文件
	let tailFileLog = config.DDV_OUT_LOG_FILE_PATH;
	//监听的输出错误文件
	let tailFileErr = config.DDV_ERR_LOG_FILE_PATH;
	//打印开始监听
	log.tip('INFO','CLI_LISTEN_LOG_TAIL_CHANGE_START');

	let stdoutWrite = (data, isAppend_R_N) => {
		process.stdout.write(data);
		if (isAppend_R_N) {
			process.stdout.write(EOL);
		}
	};
	//通过node的tail监听输出日志
	let tailByNodeLog = () => {
		//实例化监听模块
		let tail = new Tail(tailFileLog, options);
		//打印每一行
		tail.on('line',  (data) => {
			stdoutWrite(data, true);
		});
		//监听出错了
		tail.on('error', (error) => {
			stdoutWrite('ERROR by node tail : ');
			console.error(error);
		});
		//开始监听
		tail.watch();
		//监听进程退出
		process.on('exit', ()=>{
			tail.unwatch();
		});
	};
	//通过node的tail监听错误日志
	let tailByNodeErr = () => {
		//实例化监听模块
		let tail = new Tail(tailFileErr, options);
		//打印每一行
		tail.on('line',  (data) => {
			stdoutWrite(data, true);
		});
		//监听出错了
		tail.on('error', (error) => {
			stdoutWrite('ERROR by node tail : ');
			console.error(error);
		});
		//开始监听
		tail.watch();
		//监听进程退出
		process.on('exit', ()=>{
			tail.unwatch();
		});
	};
	let isStdout = false;
	//通过shell的tail监听输出日志
	let tailByShellTailLog = () => {
		let tail = child_process.spawn('tail',['-f', tailFileLog]);
		tail.stdout.on('data', (data) => {
			isStdout = true ;
			stdoutWrite(data);
		});

		tail.stderr.on('data', (data) => {
			if (isStdout===true) {
				stdoutWrite('ERROR by node shell : ');
				console.error(data);
			}
		});

		tail.on('close', (code) => {
			if (isStdout===false) {
				tailByNode();
			}else{
				process.exit(config.SUCCESS_EXIT);
			}
		});
		process.on('exit', ()=>{
			try{
				tail.kill();
			}catch(e){}
		});
	};
	//通过shell的tail监听错误日志
	let tailByShellTailErr = () => {
		let tail = child_process.spawn('tail',['-f', tailFileErr]);
		tail.stdout.on('data', (data) => {
			isStdout = true ;
			stdoutWrite(data);
		});

		tail.stderr.on('data', (data) => {
			if (isStdout===true) {
				stdoutWrite('ERROR by node shell : ');
				console.error(data);
			}
		});

		tail.on('close', (code) => {
			if (isStdout===false) {
				tailByNode();
			}else{
				process.exit(config.SUCCESS_EXIT);
			}
		});
		process.on('exit', ()=>{
			try{
				tail.kill();
				console.log('4344');
			}catch(e){
				console.log('呵呵',e);
			}
		});
	};
	//通过node的tail监听日志
	let tailByNode = () => {
		if (type=='all'||type=='log') {
			tailByNodeLog();
		}
		if (type=='all'||type=='err'||type=='error') {
			tailByNodeErr();
		}
	};
	//通过shell的tail监听日志
	let tailByShellTail = () => {
		if (type=='all'||type=='log') {
			tailByShellTailLog();
		}
		if (type=='all'||type=='err'||type=='error') {
			tailByShellTailErr();
		}
	};
	//开始监听
	if (process.platform=='win32'||process.platform=='win64') {
		tailByNode();
	}else{
		tailByShellTail();
	}
};

//通过路径获取name
c._cmdGetPathName = function(_path, name){
	const r = Object.create(null);
	//r.siteId = b.is.number(_path)?parseInt(_path):-1;
	//转为绝对路径
	_path = path.resolve(_path,'.');
	if (!name) {
		//如果没有传入名称，使用路径末尾的名字
		name = path.basename(_path);
		if (path.extname(name)==='.js') {
			name = path.basename(path.dirname(_path));
		}
	}
	r.path = _path;
	r.name = name;
	return r;
};
//通过siteId或者站点名字操作
c._cmdFnBySiteIdName = function (type){
	var args = Object.create(null);
	args.siteIds = [];
	args.name = [];
	if (b.is.number(c.args&&c.args[0])) {
		args.siteIds.push(c.args[0]);
	}else if (b.is.string(c.args&&c.args[0])) {
		args.name.push(c.args[0]);
	}
	b.each((c.siteId||'').split(','),function(index, t) {
		if (t) {
			b.each((t||'').split('|'),function(index, siteId) {
				if (siteId) {
					args.siteIds.push(siteId);
				}
			});
		}
	});
	b.each((c.name||'').split(','),function(index, t) {
		if (t) {
			b.each((t||'').split('|'),function(index, name) {
				if (name) {
					args.name.push(name);
				}
			});
		}
	});
	args.siteIds = args.siteIds.join(',');
	args.name = args.name.join(',');
	let is_server = !(args.siteIds||args.name);
	if (is_server) {
		switch(type||''){
			case 'start':
			case 'restart':
			case 'reload':
			case 'stop':
				break;
			default:
				log.tip('ERR ','CLI_COMMAND_ARGUMENTS_NOT_EMPTY');
				c.parse([c.argv_source[0], c.argv_source[1], type, '--help']);
				args = type = void 0;
				return ;
		}
	}

	c.__api(type, args,(err, res)=>{
		let logkey  = 'CLI_COMMAND_'+type.toUpperCase();
			//加入服务器或者站点
			logkey += is_server?'_SERVER_':'_STIE_';
			//加入成功失败
			logkey += err?'FAIL':'SUCCESS';
			//提示结果
			log.tip((err?'ERR ':' OK '), logkey);
		if (err) {
			console.error(colors.grey(err.message));
			console.error('');
			c.__disconnect();
		}else{
			//显示列表
			c._cmdLists();
		}
		logkey = is_server = type = void 0;
	});
	args = void 0;
};
//显示列表
c._cmdLists = function _cmdLists(is_echo_json, is_prettified_json){
	c.__api(true, 'lists', {
		'is_status':true
	},function callback(e, res){
		if (e) {
			//提示获取失败
	 		log.tip('FAIL','CLI_COMMAND_GET_STIE_LISTS_FAIL');
	 		console.error(colors.red(e.message));
	 		console.error('');
	 		console.error(e);
		}else{
	 		if (is_echo_json) {
	 			console.log(colors.yellow(JSON.stringify(res, null, (is_prettified_json?2:null))));
	 		}else{
	 			let Table = require('cli-table2');
	 			let statusLists = ['ErrorTrys', 'ErrorMast', 'ErrorConf', 'Stoped', 'Runing', 'Restarting', 'Listening'];
				// 实例
				let table = new Table({
					head:       ['Site name', 'id',      'pid' , 'status' , 'restart', 'uptime' , 'memory' ,  'ws'  ,  'http'  ,  'sk'   ,   'debug' ],
					colAligns : ['left',     'center', 'center', 'center' , 'center' , 'center' , 'center' ,'center', 'center' , 'center',   'center'],
					style :     {'padding-left' : 1, head : ['cyan', 'bold'], compact : true}
				});
				b.each(res, function(siteId, site) {
					if (site.children&&site.children.length==1) {
						delete site.children[0].name;
						b.extend(true, site, site.children[0]);
						delete site.children;
					}
					if (site.children&&site.children.length>0) {
						site.status = 'Listening';
						site.memory = 0 ;
						site.ws = 0 ;
						site.http = 0 ;
						site.socket = 0 ;
						b.each(site.children ,function(index, child) {
							child.name = child.name|| 'worker';
							child.name = ((site.children.length==index+1)?' └─ ':' ├─ ')+child.name;
							//最后更新时间
							child.lastUptime = site.lastUptime;
							site.memory+= (parseInt(child.memory)||0);
							site.ws+= (parseInt(child.ws)||0);
							site.http+= (parseInt(child.http)||0);
							site.socket+= (parseInt(child.socket)||0);
							//状态取大原则
							site.status = statusLists.indexOf(child.status) < statusLists.indexOf(site.status)?child.status:site.status;
						});
						//插入标题
						tool._cmdListsTablePush(table, site);
						//遍历插入
						b.each(site.children ,function(index, child) {
							//插入分支
							tool._cmdListsTablePush(table, child);
						});
					}else{
						tool._cmdListsTablePush(table, site);
					}

					siteId = site = undefined;
				});
				console.log(table.toString());
				table = undefined ;
	 		}
			is_echo_json = is_prettified_json = res = undefined;
		}

	});
};


const tool = Object.create(null);
tool._cmdListsTablePush = (table, site)=>{
	tool._cmdListsColors(site);
	let info = [];
	//Site name
	info.push(site.name);
	//id
	info.push((site.siteId==void 0)?'-':site.siteId);
	//pid
	info.push((site.pid==void 0)?'-':site.pid);
	//status restart uptime
	info.push((site.status||'Unknow'), (site.restart||0), tool.timeSince(site.lastUptime||0));
	//memory ws http socket
	info.push(tool.bytesToSize((site.memory||0),3), site.ws, site.http, site.socket);
	info.push(site.debug);
	table.push(info);
};
tool._cmdListsColors = (site)=>{
	switch(site.status){
		//监听中-绿色
		case 'Listening':
			site.status = colors.green.bold(site.status);
			site.name = colors.cyan.bold(site.name);
			break;
		//启动中-黄色
		case 'Restarting':
		case 'Runing':
			site.status = colors.yellow.bold(site.status);
			site.name = colors.cyan.bold(site.name);
			break;
		//已经停止的-红色
		case 'Stoped':
		case 'ErrorConf':
		case 'ErrorMast':
		case 'ErrorTrys':
			site.status = colors.red.bold(site.status);
			site.name = colors.red.bold(site.name);
			break;
		//其他-粉色
		default :
			site.status = colors.magenta.bold(site.status);
			site.name = colors.magenta.bold(site.name);
			break;
	}
	site.debug = colors[((site.debug=='Enabled')?'green':'grey')](site.debug);
};

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

tool.pad = function pad(str, width) {
	var len = Math.max(0, width - str.length);
	return str + Array(len + 1).join(' ');
};

tool.bytesToSize = function(bytes, precision) {
	var kilobyte = 1024;
	var megabyte = kilobyte * 1024;
	var gigabyte = megabyte * 1024;
	var terabyte = gigabyte * 1024;

	if ((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + 'B';
	} else if ((bytes >= kilobyte) && (bytes < megabyte)) {
		return (bytes / kilobyte).toFixed(precision) + 'KB';
	} else if ((bytes >= megabyte) && (bytes < gigabyte)) {
		return (bytes / megabyte).toFixed(precision) + 'MB';
	} else if ((bytes >= gigabyte) && (bytes < terabyte)) {
		return (bytes / gigabyte).toFixed(precision) + 'GB';
	} else if (bytes >= terabyte) {
		return (bytes / terabyte).toFixed(precision) + 'TB';
	} else {
		return bytes + 'B';
	}
};
tool.timeSince = function timeSince(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + 'Y';
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + 'M';
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + 'D';
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + 'h';
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + 'm';
	}
	return Math.floor(seconds) + 's';
};

c.api = null ;
//断开连接
c.__disconnect = function() {
	if (c.api&&b.type(c.api.disconnect, 'function')) {
		c.api.disconnect();
	}
	c.api = null;
};
//连接上
c.__connect = function(callback){
	callback = callback || function(){};

	new Promise(function(resolve, reject) {
		//检测是否有存在的api
		if (c.api&&c.api.state===true) {
			process.nextTick(function() {
				resolve();
			});
		}else{
			reject(new Error('api not find'));
		}
	}).catch(()=>{
		//试图建立连接
		return new Promise(function(resolve, reject) {
			try{
				c.api = new Api((err, pid)=>{
					if(err){
						reject(err);
					}else{
						resolve(pid);
					}
				});
			}catch(err){
				reject(err);
			}
		});
	}).catch(()=>{
		//因为连接失败，试图启动后台进程
		return new Promise(function(resolve, reject) {
			if (typeof startDaemon==='function') {
				startDaemon((err)=>{
					if (err) {
						reject(err);
					}else{
						resolve();
					}
				});
			}else{
				reject(new Error('There is no regular way to start the background'));
			}
		}).then(()=>{
			return new Promise(function(resolve, reject) {
				//再次试图连接
				try{
					c.api = new Api((err, pid)=>{
						if(err){
							reject(err);
						}else{
							resolve(pid);
						}
					});
				}catch(err){
					reject(err);
				}
			});
		});
	}).then(()=>{
		if (typeof callback==='function') {
			callback(null, this);
		}
		callback = void 0;
	}).catch((e)=>{
		if (typeof callback==='function') {
			callback(e, null);
		}
		callback = void 0;
	});
};
