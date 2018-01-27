const fs = require('fs')
const imdb = require('imdb-api')
const pMap = require('p-map')

const data = fs.readFileSync('./imdb-ids.json').toString().split('\n').map(JSON.parse)

const API_KEY = 'f2232f1a'

const getter = async row => {
  const id = row.imdb_id
  try {
    const movie = await imdb.getById(id, {apiKey: API_KEY})
    const res = {
      plot: movie.plot,
      imdb_id: id,
    }
    console.log(JSON.stringify(res))
    return res
  } catch (err) {
    console.log(err)
    return
  }
}

pMap(data.slice(126), getter, { concurrency: 10 }).then(() => {})
