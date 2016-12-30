'use strict';
const cjbbase = require('cjb-base');
const fs = require('fs');
const os = require('os');
const path = require('path');
const child_process = require('child_process');
const constants = require('./constants.js');
const locale = require('./os.locale.js');
const undefinevoid = void 0;
const isUuidRegex = /^[\da-fA-F]{8}\-[\da-fA-F]{4}\-[\da-fA-F]{4}\-[\da-fA-F]{4}\-[\da-fA-F]{12}$/;
const uuidRegex = /[\da-fA-F]{8}\-[\da-fA-F]{4}\-[\da-fA-F]{4}\-[\da-fA-F]{4}\-[\da-fA-F]{12}/;
const DdvConfig = function DdvConfig(){};
	  DdvConfig.prototype = Object.create(null);
	  DdvConfig.prototype.reload = function DdvConfigReload(isReload){
		config.isReload = isReload || false;
		init();
	  };
	  DdvConfig.prototype.save = function saveConfig(){
		init.saveConfig();
	  };
const config = new DdvConfig();
const init = function(){
	config.isReload = config.isReload || false;
	//获取语言locale
	init.locale();
	//基本信息
	init.baseInfo();
	//尝试获取ddv-home-path
	init.ddvHomePath();
	//尝试获取ddv-config-path
	init.ddvConfigPath();
	//尝试 加载 config
	init.loadConfig();
	//尝试 加载 package
	init.package();
	//尝试 获取 server guid
	init.serverGuid();
	//获取常量
	init.getConstants();
	//载入结束，不需要重载
	config.isReload = false;
	//保存配置
	init.saveConfig();
};
cjbbase.extend(init, {
	//获取 package
	package : function ddvHomePathInit(){
		config.pkg = require('../../package.json');
		if (config.isReload===false) {
			if (config.version!==config.pkg.version) {
				//由于系统版本更新，尝试重新载入所有配置信息
				config.isReload=true;
			}
		}
		//覆盖新版本
		config.version = config.pkg.version || '0.0.0';
	},
	//获取home path
	locale : function localeInit(){
		//判断是否需要重新获取
		if (config.isReload===false&&config.locale) {
			return ;
		}
		config.locale = locale();
	},
	//获取home path
	baseInfo : function baseInfo(){
		//系统内核
		config.platform = process.platform;
		//工作目录
		config.cwd = process.cwd();
		//cpu架构
		config.arch = process.arch;
		//运行的环境目录
		config.execPath = (config.platform != 'darwin' ? path.dirname(process.execPath) : process.env.PATH)||config.execPath;
		//获取 用户home目录
		config.homePath = process.env.HOME_PATH || process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || config.homePath;
		config.homePath = path.resolve(config.homePath,'.');
		//ddv入口文件
		config.ddvMainFile = process.mainModule.filename||config.ddvMainFile;
		//不保存进入配置文件目录
		config.continueKeys = ['pkg', 'dir', 'isReload', 'version', 'continueKeys', 'platform', 'arch'];
		//基本程序目录
		config.dir = Object.create(null);
		config.dir.bin = path.resolve(__dirname,'../../bin');
		config.dir.lib = path.resolve(__dirname,'../../lib');
		config.dir.api = path.resolve(__dirname,'../api');
		config.dir.cli = path.resolve(__dirname,'../cli');
		config.dir.config = path.resolve(__dirname,'../config');
		config.dir.daemon = path.resolve(__dirname,'../daemon');
		config.dir.language = path.resolve(__dirname,'../language');
		config.dir.log = path.resolve(__dirname,'../log');
		config.dir.parseCli = path.resolve(__dirname,'../parseCli');
		config.dir.scripts = path.resolve(__dirname,'../scripts');
		config.dir.server = path.resolve(__dirname,'../server');
		config.dir.telnetCli = path.resolve(__dirname,'../telnetCli');
		config.dir.ddvstatic = path.resolve(__dirname,'../ddvstatic');
	},
	//获取home path
	ddvConfigPath : function ddvConfigPath(){
		//用户home目录
		config.ddvConfigPath = process.env.DDV_CONFIG_PATH || config.ddvConfigPath ;
		//判断是否需要重新获取
		if (config.isReload===false&&config.ddvConfigPath) {
			return ;
		}
		if (config.ddvConfigPath===undefinevoid||config.ddvConfigPath==='') {
			config.ddvConfigPath = path.resolve(config.ddvHomePath,'config.json');
		}
	},
	//获取ddv home path
	ddvHomePath : function ddvHomePath(){
		var p ;
			//尝试从环境变量中提取 因为环境变量优先处理
			p = process.env.DDV_HOME;
			if (!init.checkDdvHomePath(p)) {
				p = process.env.DDV_HOME_PATH;
			}
			//检测 目录是否通过
			if (init.checkDdvHomePath(p)) {
				config.ddvHomePath = p ;
				return ;
			}
			//判断是否需要重新获取
			if (config.isReload===false&&config.ddvHomePath) {
				return ;
			}
			switch(config.platform){
				case 'win32':
				case 'win64':
					//公共用户目录
					if (!init.checkDdvHomePath(p = (process.env.PUBLIC+path.sep+'ddv'))) {
						//放进程序目录
						p = process.env.ProgramFiles+path.sep+'ddv'+path.sep+'conf';
					}
					if (init.checkDdvHomePath(p)) {
						config.ddvHomePath = p ;
						return ;
					}
				break;
				//case 'darwin':
				default:
					p = path.resolve('/etc', 'ddv');
				break;
			}
			//如果存在该目录就直接返回
			if (init.checkDdvHomePath(p)) {
				config.ddvHomePath = p ;
				return ;
			}
			//尝试放入home目录
			if (config.homePath) {
				p = path.resolve(config.homePath, 'ddv'+path.sep+'conf');
			}
			if (init.checkDdvHomePath(p)) {
				config.ddvHomePath = p ;
				return ;
			}
			throw Error('config load fail');
	},
	//获取配置信息
	loadConfig : function loadConfig(){
		var is_exists = false, tempConfig;
		try{
			let stat = fs.statSync(config.ddvConfigPath);
			is_exists = Boolean(stat.isFile());
		}catch(e){}
		if (is_exists) {
			tempConfig = require(config.ddvConfigPath);
			for (let key in tempConfig) {
				if (!Object.prototype.hasOwnProperty.call(tempConfig, key)) continue;
				if (config.continueKeys.indexOf(key)>-1) continue;
				if (config[key]&&(!cjbbase.type(config[key], 'string'))&&(!cjbbase.type(config[key], 'number'))) {
					cjbbase.extend.call(config[key], true, config[key], tempConfig[key]);
				}else{
					config[key] = tempConfig[key] ;
				}
			}
			tempConfig = undefinevoid ;
		}else{
			init.saveConfig();
		}
	},
	//获取常量数据
	getConstants:function getConstants() {
		let tempConfig = constants(config);
		for (let key in tempConfig) {
			if (!Object.prototype.hasOwnProperty.call(tempConfig, key)) continue;
			if (config[key]&&(!cjbbase.type(config[key], 'string'))&&(!cjbbase.type(config[key], 'number'))) {
				cjbbase.extend.call(config[key], true, config[key], tempConfig[key]);
			}else{
				config[key] = tempConfig[key] ;
			}
			config.continueKeys[config.continueKeys.length] = key;
		}
		tempConfig = undefinevoid ;
	},
	//获取ddv home path
	checkDdvHomePath : function checkDdvHomePath(p){
		if (p===undefinevoid||p==='') {
			return false;
		}
		var stat ;
		try{
			stat = fs.statSync(p);
			return Boolean(stat.isDirectory());
		}catch(e){
			if (e.code == 'ENOENT') {
				try{
					let r = init.mkdirsSync(p, 0o777);
					try{
						fs.chmodSync(p, 0o777);
					}catch(e){}
					return r;
				}catch(e_m){
					return false;
				}
			}
		}
		return false;
	},
	//创建多层文件夹 同步
	mkdirsSync:function mkdirsSync(dirpath, mode) {
		if (!fs.existsSync(dirpath)) {
			let pathtmp, isMkdirsState = true;
			dirpath.split(path.sep).forEach(function(dirname) {
				if (pathtmp) {
					pathtmp = path.join(pathtmp, dirname);
				}else {
					pathtmp = dirname;
				}
				if (dirname===void 0 || dirname === '') {
					pathtmp = path.join(pathtmp, path.sep);
					return ;
				}
				let is_exists = false ;
				try{
					let stat = fs.statSync(pathtmp);
					is_exists = Boolean(stat.isDirectory());
				}catch(e){}
				if (!is_exists) {
					if (!fs.mkdirSync(pathtmp, mode)) {
						isMkdirsState = false;
						return false;
					}
				}
			});
			return isMkdirsState;
		}
		return true;
	},
	//判断是否为guid
	isServerGuid:function(uuid){
		return isUuidRegex.test(uuid);
	},
	//处理服务器的guid
	serverGuid:function serverGuid() {
		var guid = process.env.SERVER_GUID||config.serverGuid;
		if (init.isServerGuid(guid)) {
			config.serverGuid = guid;
			return;
		}
		if (config.isReload===false&&init.isServerGuid(config.serverGuid)) {
			return;
		}
		try{
			config.serverGuid = init.getServerGuid();
		}catch(e){
			throw new Error('请配置环境变量serverGuid');
		}
	},
	getServerGuid:function getServerGuid(cmdPrefix) {
		var cmd, args, delimiter, uuid, error;
			cmdPrefix = cmdPrefix || '';
			//参数
			args = ['UUID', 'Serial'];
			//分隔符
			delimiter = ': ';
			switch (config.platform) {
				//windows 系统
				case 'win32':
				case 'win64':
					//分隔符
					delimiter = '\r\n';
					//参数
					args[1] = 'IdentifyingNumber';
					//命令
					cmd = 'wmic CsProduct Get ';
					//结束
					break;
				//mac os 系统
				case 'darwin':
					//命令
					cmd = 'system_profiler SPHardwareDataType | grep ';
					break;
				//linux 系统
				case 'linux':
					//cpu架构
					if (config.arch === 'arm') {
						//arm的命令
						cmd = 'cat /proc/cpuinfo | grep ';
					} else {
						//其他的命令
						cmd = 'dmidecode -t system | grep ';
					}
					break;
				//freebsd 系统
				case 'freebsd':
					//其他的命令
					cmd = 'dmidecode -t system | grep ';
					break;
			}
			//通过cmd获取
			if (cmd) {
				try{
					let res = child_process.execSync(cmdPrefix + cmd + args[0]);
						res = init.getServerGuidParseResult(res?res.toString().toLowerCase():'', delimiter);
						let t;
						if (res&&res.length>0&&(t = uuidRegex.exec(res))) {
							uuid = t[0] ;
						}
				}catch(e){
					error = e ;
				}
				if (!(uuid&&init.isServerGuid(uuid||''))) {
					try{
						let res = child_process.execSync(cmdPrefix + cmd + args[1]);
							res = init.getServerGuidParseResult(res?res.toString().toLowerCase():'', delimiter);
							if (res&&res.length>0) {

								let t;
								if (res&&res.length>0&&(t = uuidRegex.exec(res))) {
									uuid = t[0] ;
								}else{
									let i, rid, rid_new;
									res = res.replace(/\s+/g,'');
									//种子
									rid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
									rid_new = '';
									for (i = rid.length - 1; i >= 0; i--) {
										let rid_t = rid[i] ;
										if (rid_t == 'x') {
											let rid_len = res.length ;
											while(rid_len>0&&(rid_t = res.charAt(rid_len-1)).replace(/[\da-f]/g,'')!==''){
												res = res.substr(0, rid_len-1);
												if (rid_t.replace(/[g-z]/g,'')==='') {
													let rid_num = parseInt(rid_t,36);
													while(rid_num>0){
														if (rid_num>16) {
															res += 'f';
															rid_num -=16;
														}else{
															res += rid_num.toString(16);
															rid_num = -1;
														}
													}
												}
												rid_len = res.length ;
											}
											rid_t = res ? res.charAt(rid_len-1):'x';
											res = res.substr(0, rid_len-1);
										}
										rid_new = rid_t + rid_new;
									}
									//补充剩下部分
									uuid = rid_new.replace(/[xy]/g,'0');
								}
							}
					}catch(e){}
				}
				if (!(uuid&&init.isServerGuid(uuid))) {
					switch (config.platform) {
						//mac os 系统
						case 'darwin':
							try{
								let res = child_process.execSync(cmdPrefix + 'ioreg -rd1 -c IOPlatformExpertDevice');
									res = init.getServerGuidParseResult(res?res.toString().toLowerCase():'', delimiter);

								let t;
									if (res&&res.length>0&&(t = uuidRegex.exec(res))) {
										uuid = t[0] ;
									}
							}catch(e){
								error = e ;
							}
							break;
					}
				}
			}
			if (uuid&&init.isServerGuid(uuid)) {
				return uuid;
			}else{
				throw new Error('Cannot provide serial number for ' + config.platform);
			}
	},
	getServerGuidParseResult : function getServerGuidParseResult(input, delimiter) {
		return input.slice(input.indexOf(delimiter) + 2).trim();
	},
	//保持配置
	saveConfig : function saveConfig() {
		var key, writeConfig = Object.create(null);
		for (key in config) {
			if (!Object.prototype.hasOwnProperty.call(config, key)) continue;
			if (config.continueKeys.indexOf(key)>-1) continue;
			writeConfig[key] = config[key];
		}
		fs.writeFileSync(config.ddvConfigPath, JSON.stringify(writeConfig, '', 2), {
			encoding:'utf8',
			mode: 0o666,
			flag:'w'
		});
		try{
			fs.chmodSync(config.ddvConfigPath, 0o666);
		}catch(e){}
	}


});
//判断是否需要初始化
if (!(config&&config.ddvHomePath)) {
	config.reload();
}
module.exports = config;
