/**
 * Copyright 2013 the DDV project authors. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

var fs = require('fs');
var path = require('path');

var dt = fs.readFileSync(path.join(__dirname, 'ddv-cmd-logo'));

console.log(dt.toString());