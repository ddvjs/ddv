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
    command: {
      tail: '\'site_name\'是网站名称，此命令的功能是监视日志更改，并实时输出',
      add: {
        site: '添加一个站点',
        name: '添加一个站点，并且设置站点名字',
        site_help: '添加站点帮助'
      },
      remove: {
        main: '删除一个站点',
        alias: '删除一个站点(remove 别名)',
        site_by_id: '从DDV服务器中列表中删除指定ID站点',
        site_by_name: '从DDV服务器中列表中删除指定名字的站点',
        site_help: '删除站点帮助'
      },
      lists: {
        main: '列出所有网站',
        alias: '列出所有网站(lists 别名)',
        json: '以JSON格式列出所有网站',
        json_prettified: '以美化的JSON格式列出所有网站'
      },
      start: {
        site: '启动指定站点',
        server: '启动DDV服务'
      },
      restart: {
        site: '重启指定站点',
        server: '重启DDV服务'
      },
      reload: {
        server: '重新加载DDV服务器网站的更改'
      },
      stop: {
        site: '停止指定站点',
        server: '停止DDV服务'
      },
      resurrect: '在重新启动之前复活进程',
      guid: {
        get: '获取服务器guid',
        set: '设置服务器guid'
      },
      kill: '杀死DDV守护进程',
      update: '更新DDV程序',
      more: {
        examples_in: '更多使用说明在',
        help: '详细帮助'
      }
    }
  },
  command: {
    tail: {
      watch_log_start: '监听日志尾变化开始',
      not_supported: '不支持该类型'
    },
    lists: {
      fail: '${red}${bold}获取网站列表失败！${bold.close}${red.close}',
      echoJson: 'json:\n${yellow}%s${yellow.close}',
      head: [
        'Site name',
        'id',
        'pid',
        'status',
        'restart',
        'uptime',
        'memory',
        'ws',
        'http',
        'sk',
        'debug'
      ]
    },
    add: {
      stie: {
        success: '${green}${bold}添加网站成功！${bold.close}${green.close}',
        fail: '${red}${bold}添加站点失败！${bold.close}${red.close}'
      }
    },
    remove: {
      stie: {
        success: '${green}${bold}删除站点成功!${bold.close}${green.close}',
        fail: '${red}${bold}删除站点失败!${bold.close}${red.close}'
      }
    },
    start: {
      stie: {
        success: '${green}${bold}开启站点成功!${bold.close}${green.close}',
        fail: '${red}${bold}开启站点失败!${bold.close}${red.close}'
      },
      server: {
        success: '${green}${bold}开启服务成功!${bold.close}${green.close}',
        fail: '${red}${bold}开启服务失败!${bold.close}${red.close}'
      }
    },
    restart: {
      stie: {
        success: '${green}${bold}重启站点成功!${bold.close}${green.close}',
        fail: '${red}${bold}重启站点失败!${bold.close}${red.close}'
      },
      server: {
        success: '${green}${bold}重启服务成功!${bold.close}${green.close}',
        fail: '${red}${bold}重启服务失败!${bold.close}${red.close}'
      }
    },
    reload: {
      server: {
        success: '${green}${bold}重载站点成功!${bold.close}${green.close}',
        fail: '${red}${bold}重载站点失败!${bold.close}${red.close}'
      }
    },
    stop: {
      stie: {
        success: '${green}${bold}停止站点成功!${bold.close}${green.close}',
        fail: '${red}${bold}停止站点失败!${bold.close}${red.close}'
      },
      server: {
        success: '${green}${bold}停止服务成功!${bold.close}${green.close}',
        fail: '${red}${bold}停止服务失败!${bold.close}${red.close}'
      }
    },
    guid: {
      get: {
        success: '${green}${bold}获取服务器guid成功!${bold.close}${green.close}',
        fail: '${red}${bold}获取服务器gui失败!${bold.close}${red.close}'
      },
      set: {
        success: '${green}${bold}设置服务器guid成功!${bold.close}${green.close}',
        fail: '${red}${bold}设置服务器guid失败!${bold.close}${red.close}'
      },
      res: '${green}${bold}GUID:${bold.close}${green.close}%s'
    },
    help: '显示命令帮助',
    not_found: '找不到命令:[ %s ]',
    arguments_not_empty: '${red}${bold}命令行参数不能为空!${bold.close}${red.close}'
  }
}
