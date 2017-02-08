'use strict'
/* eslint-disable no-template-curly-in-string */
module.exports = {
  output: {
    description: {
      help: 'output usage information',
      version: 'Get the dvd version information',
      site_name: 'site name',
      site_id: 'site id',
      no_run_daemon: 'Do not start background daemon threads',
      silent: 'hide all messages'
    }
  },
  help: {
    command: {
      tail: '\'site_name\' is the name of the site, The function of this command is to monitor the log changes, and real-time output',
      add: {
        site: 'Add an site',
        name: 'Add an site + set a name',
        site_help: 'Add site help'
      },
      remove: {
        main: 'Remove an site',
        alias: 'Remove an site(remove alias)',
        site_by_id: 'Removes site from the list in the DDV server by ID',
        site_by_name: 'Removes site from the list in the DDV server by stie_name',
        site_help: 'Remove site help'
      },
      lists: {
        main: 'list all site',
        alias: '(lists alias) list all site',
        json: 'list all site in JSON format',
        json_prettified: 'print json in a prettified JSON'
      },
      start: {
        site: 'Start site',
        server: 'Start ddv server'
      },
      restart: {
        site: 'Restart site',
        server: 'Restart ddv server'
      },
      reload: {
        server: 'Reload the ddv server site changes'
      },
      stop: {
        site: 'Stop site',
        server: 'Stop ddv server'
      },
      resurrect: 'Restart the process before the resurrection',
      guid: {
        get: 'Get the server GUID',
        set: 'Set the server GUID'
      },
      kill: 'Kill daemon ddv',
      update: 'Update ddv',
      more: {
        examples_in: 'More examples in',
        help: 'More help'
      }
    }
  },
  command: {
    tail: {
      watch_log_start: 'Listen to the log tail change start',
      not_supported: 'This type is not supported'
    },
    lists: {
      fail: '${red}${bold}get site lists fail!${bold.close}${red.close}',
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
        success: '${green}${bold}add site success!${bold.close}${green.close}',
        fail: '${red}${bold}add site fail!${bold.close}${red.close}'
      }
    },
    remove: {
      stie: {
        success: '${green}${bold}Remove a site success!${bold.close}${green.close}',
        fail: '${red}${bold}Remove a site failed!${bold.close}${red.close}'
      }
    },
    start: {
      stie: {
        success: '${green}${bold}Start a site success!${bold.close}${green.close}',
        fail: '${red}${bold}Start a site failed!${bold.close}${red.close}'
      },
      server: {
        success: '${green}${bold}Start ddv server success!${bold.close}${green.close}',
        fail: '${red}${bold}Start ddv server failed!${bold.close}${red.close}'
      }
    },
    restart: {
      stie: {
        success: '${green}${bold}Restart a site success!${bold.close}${green.close}',
        fail: '${red}${bold}Restart a site failed!${bold.close}${red.close}'
      },
      server: {
        success: '${green}${bold}Restart ddv server success!${bold.close}${green.close}',
        fail: '${red}${bold}Restart ddv server failed!${bold.close}${red.close}'
      }
    },
    reload: {
      server: {
        success: '${green}${bold}Reload site success!${bold.close}${green.close}',
        fail: '${red}${bold}Reload site failed!${bold.close}${red.close}'
      }
    },
    stop: {
      stie: {
        success: '${green}${bold}Stop a site success!${bold.close}${green.close}',
        fail: '${red}${bold}Stop a site failed!${bold.close}${red.close}'
      },
      server: {
        success: '${green}${bold}Stop ddv server success!${bold.close}${green.close}',
        fail: '${red}${bold}Stop ddv server failed!${bold.close}${red.close}'
      }
    },
    guid: {
      get: {
        success: '${green}${bold}get the server GUID success!${bold.close}${green.close}',
        fail: '${red}${bold}get the server GUID failed!${bold.close}${red.close}'
      },
      set: {
        success: '${green}${bold}Setting the server GUID success!${bold.close}${green.close}',
        fail: '${red}${bold}Setting the server GUID failed!${bold.close}${red.close}'
      },
      res: '${green}${bold}GUID:${bold.close}${green.close}%s'
    },
    help: 'show command help',
    not_found: 'Command not found:[ %s ]',
    arguments_not_empty: '${red}${bold}The command line argument can not be null!${bold.close}${red.close}'

  }
}
