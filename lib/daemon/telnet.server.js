/** vim: et:ts=4:sw=4:sts=4
 * see: https://github.com/chengjiabao/ddv for details
 */
/*jshint node: true */
/*jshint esversion: 6 */
/*global module, process */
'use strict';
const daemon = global.daemon || null ;
if (!daemon) {
	throw new Error('daemon为空');
}
const api = module.exports = daemon.api = daemon.api || Object.create(null);
