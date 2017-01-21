module.exports = function (colors) {
  var l
  l = {
    'OPTION_DESCRIPTION_HELP': '输出使用信息',
    'OPTION_DESCRIPTION_VERSION': '获取dvd版本信息',
    'OPTION_DESCRIPTION_DEBUG': '开启调试模式',
    'OPTION_DESCRIPTION_SITE_NAME': '站点名字',
    'OPTION_DESCRIPTION_SITE_ID': '站点 id',
    'OPTION_DESCRIPTION_NO_RUN_DAEMON': '不要启动后台守护线程直接运行程序',
    'OPTION_DESCRIPTION_SILENT': '隐藏所有消息',

    'HELP_EXAMPLES_SHOW_ADD_SITE': '添加一个站点',
    'HELP_EXAMPLES_SHOW_ADD_SITEAND_NAME': '添加一个站点，并且设置站点名字',
    'HELP_EXAMPLES_SHOW_REMOVE_SITE_BY_ID': '从DDV服务器中列表中删除指定ID站点',
    'HELP_EXAMPLES_SHOW_REMOVE_SITE_BY_NAME': '从DDV服务器中列表中删除指定名字的站点',

    'HELP_EXAMPLES_SHOW_START_DDV_SERVER': '启动DDV服务',
    'HELP_EXAMPLES_SHOW_RESTART_DDV_SERVER': '重启DDV服务',
    'HELP_EXAMPLES_SHOW_RELOAD_DDV_SERVER': '载入配置变化',
    'HELP_EXAMPLES_SHOW_STOP_DDV_SERVER': '停止DDV服务',
    'HELP_EXAMPLES_SHOW_KILL_DDV_SERVER': '杀死DDV守护进程',
    'HELP_EXAMPLES_SHOW_UPDATE_DDV_SERVER': '更新DDV程序',

    'HELP_EXAMPLES_SHOW_MORE_EXAMPLES_IN': '更多使用说明在',
    'HELP_EXAMPLES_SHOW_MORE_HELP': '详细帮助',

    'HELP_EXAMPLES_SHOW_ADD_SITE_HELP': '添加站点帮助',
    'HELP_EXAMPLES_SHOW_REMOVE_SITE_HELP': '删除站点帮助',

    'COMMAND_ADD_AN_SITE_AND_SITEAND_NAME': '添加一个站点，并且设置站点名字',
    'COMMAND_REMOVE_AN_SITE': '删除一个站点',
    'COMMAND_REMOVE_ALIAS_AN_SITE': '(remove 别名)删除一个站点',

    'COMMAND_START': '启动DDV服务或者指定站点',
    'COMMAND_RESTART': '重启DDV服务或者指定站点',
    'COMMAND_RELOAD': '重新加载div服务器网站的更改',
    'COMMAND_STOP': '停止DDV服务或者指定站点',

    'COMMAND_LISTS': '列出所有网站',
    'COMMAND_LISTS_ALIAS': '(lists 别名)列出所有网站',
    'COMMAND_LISTS_JSON': '以JSON格式列出所有网站',
    'COMMAND_LISTS_JSON_PRETTIFIED': '以美化的JSON格式列出所有网站',

    'COMMAND_KILL_DAEMON_DDV': '杀死DDV守护进程',
    'COMMAND_RESURRECT': '在复活重新启动之前进程',
    'COMMAND_HELP': '显示命令帮助',

    'COMMAND_TAIL': ['\'site_name\'是网站名称，此命令的功能是监视日志更改，并实时输出']
  }
  return l
}
