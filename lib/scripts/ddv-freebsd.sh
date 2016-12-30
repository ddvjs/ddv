#!/bin/sh

# PROVIDE: ddv
# REQUIRE: LOGIN
# KEYWORD: shutdown

. /etc/rc.subr

name=ddv
rcvar=${name}_enable

load_rc_config $name

: ${ddv_user="%USER%"}

command="%DDV_PATH%"
pidfile="/home/${ddv_user}/.ddv/${name}.pid"
start_cmd="${name}_start"
stop_cmd="${name}_stop"
reload_cmd="${name}_reload"
status_cmd="${name}_status"

extra_commands="reload"

super() {
        su - "${ddv_user}" -c "$*"
}

ddv_start() {
        unset "${rc_flags}_cmd"
        if ddv_running; then
                echo "Ddv is already running, 'ddv lists' to see running processes"
        else
                echo "Starting ddv."
                super $command resurrect
        fi
}

ddv_stop() {
        echo "Stopping ${name}..."
        #super $command dump
        super $command delete all
        super $command kill
}

ddv_reload() {
        echo "Reloading ${name}"
        super $command reload all
}

ddv_status() {
        super $command list
}

ddv_running() {
        processId=$(pgrep -F ${pidfile})
        if [ "${processId}" -gt 0 ]; then
                return 0
        else
                return 1
        fi
}

run_rc_command "$1"
