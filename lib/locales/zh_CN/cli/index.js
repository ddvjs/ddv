'use strict'
/* eslint-disable no-template-curly-in-string */
module.exports = {
  output: {
    description: {
      help: '输出使用信息',
      version: '获取dvd版本信息',
      site_name: '站点名字',
      site_id: '站点 id',
      no_run_daemon: '不要启动后台守护线程直接运行程序',
      silent: '隐藏所有消息'
    }
  },
  help: {
    examples: {
      add_site: '添加一个站点',
      add_siteand_name: '添加一个站点，并且设置站点名字',
      remove_site_by_id: '从DDV服务器中列表中删除指定ID站点',
      remove_site_by_name: '从DDV服务器中列表中删除指定名字的站点',

      start_ddv_server: '启动DDV服务',
      restart_ddv_server: '重启DDV服务',
      reload_ddv_server: '载入配置变化',
      stop_ddv_server: '停止DDV服务',
      kill_ddv_server: '杀死DDV守护进程',
      update_ddv_server: '更新DDV程序',

      more_examples_in: '更多使用说明在',
      more_help: '详细帮助',

      add_site_help: '添加站点帮助',
      remove_site_help: '删除站点帮助'
    },
    command: {
      tail: '\'site_name\'是网站名称，此命令的功能是监视日志更改，并实时输出',
      add: '添加一个站点，并且设置站点名字',
      remove: '删除一个站点',
      remove_alias: '删除一个站点(remove 别名)',
      start_site: '启动指定站点',
      restart_site: '重启指定站点',
      stop_site: '停止指定站点',
      start: '启动DDV服务',
      restart: '重启DDV服务',
      reload: '重新加载DDV服务器网站的更改',
      stop: '停止DDV服务'
    }
  },
  command: {
    tail: {
      watch_log_start: '监听日志尾变化开始',
      not_supported: '不支持该类型'
    },
    help: '显示命令帮助',
    not_found: '找不到命令:[ %s ]'
  }
}
