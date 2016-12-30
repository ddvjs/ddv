#!/usr/bin/env node
'use strict';
//标题
process.title = 'ddvBin';
if (process.argv.indexOf('--no-run-daemon') > -1) {
	require('../lib/daemon/index.js');
}else{
	require('../lib/cli/index.js');
}
