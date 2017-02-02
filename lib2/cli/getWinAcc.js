'use strict'
// windows运行权限
var winRunAcc = 'guest'
const childProcess = require('child_process')
module.exports = function getWinAcc () {
  try {
    childProcess.execSync('whoami /groups | findstr /b /c:"Mandatory Label\\Protected Process Mandatory Level"')
    winRunAcc = 'protected'
  } catch (e) {
    try {
      childProcess.execSync('whoami /groups | findstr /b /c:"Mandatory Label\\System Mandatory Level"')
      winRunAcc = 'system'
    } catch (e) {
      try {
        childProcess.execSync('whoami /groups | findstr /b /c:"Mandatory Label\\High Mandatory Level"')
        winRunAcc = 'high'
      } catch (e) {
        try {
          childProcess.execSync('whoami /groups | findstr /b /c:"Mandatory Label\\Medium Mandatory Level"')
          winRunAcc = 'explorer'
        } catch (e) {
          try {
            childProcess.execSync('whoami /groups | findstr /b /c:"Mandatory Label\\Low Mandatory Level"')
            winRunAcc = 'ie'
          } catch (e) {}
        }
      }
    }
  }
  return winRunAcc
}
