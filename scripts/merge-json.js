const fs = require('fs')

const FOLDER = './json'

const total = []

fs.readdir(FOLDER, (err, files) => {
  files.forEach((file, idx) => {
    console.log(file)
    if (file.slice(-4) === 'json') {
      const readFile = fs.readFileSync(FOLDER + '/' + file)
      const json = JSON.parse(readFile.toString())
      json.forEach(row => {
        if (total.some(i => i.id === row.id)) return
        total.push(row)
      })
    }
    console.log(total.length)
    fs.writeFileSync('./results.json', JSON.stringify(total, undefined, 4))
  })
})
