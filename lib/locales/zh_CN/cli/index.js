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
    }
  }
}
