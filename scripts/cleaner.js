const fs = require('fs')

const file = fs.readFileSync('./plots.json').toString().split('\n')

const filtered = file.filter(row => {
  return row.slice(0,5) === `{"plo`
})

filtered.forEach(c => console.log(c))
