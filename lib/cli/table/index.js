const Table = require('table')
const table = Table.table
const config = Object.create(null)
const getTable = module.exports = function getTable (data, c) {
  return table(data, Object.assign(Object.create(null), config, c))
}
Object.assign(config, {
  border: {
    topBody: `─`,
    topJoin: `┬`,
    topLeft: `┌`,
    topRight: `┐`,
    bottomBody: `─`,
    bottomJoin: `┴`,
    bottomLeft: `└`,
    bottomRight: `┘`,
    bodyLeft: `│`,
    bodyRight: `│`,
    bodyJoin: `│`,
    joinBody: `─`,
    joinLeft: `├`,
    joinRight: `┤`,
    joinJoin: `┼`
  },
  toString: Object.prototype.toString
})
Object.assign(getTable, {
  lists (o, lists, c) {
    var data = []
    // o.head && data.push(o.head)
    Array.isArray(lists) && Array.isArray(o.keys) && lists.forEach(line => {
      var lineArray = []
      if (line) {
        o.keys.forEach((key, i) => {
          lineArray.push((typeof o.fns[i] === 'function') ? o.fns[i](line[key]) : line[key])
        })
        data.push(lineArray)
      }
      lineArray = line = void 0
    })
    c = typeof c === 'object' ? c : Object.create(null)
    Array.isArray(o.colAligns) && (c.columns = typeof c.columns === 'object' ? c.columns : Object.create(null))
    Array.isArray(o.colAligns) && o.colAligns.forEach((align, i) => {
      if (!c.columns[i]) {
        c.columns[i] = {}
      }
      c.columns[i]['alignment'] = align
    })

    let Table2 = require('cli-table2')
    // 实例
    let table2 = new Table2({
      head: o.head,
      colAligns: ['left', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center'],
      style: {'padding-left': 1, head: ['cyan', 'bold'], compact: true}
    })
    table2.push.apply(table2, data)
    return table2.toString()
  }
})
