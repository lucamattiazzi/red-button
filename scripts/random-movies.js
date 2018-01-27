const imdb = require('imdb-api')
const csv = require('fast-csv')
const fs = require('fs')
const got = require('got')

const MOVIEDB_KEY = process.env.MOVIEDB_KEY
const MOVIEDB_BASE_URI = 'https://image.tmdb.org/t/p/w500'
const IMAGE_PATH = './images'
const DELAY = 500
let time

const sleep = ms => {
  return new Promise((res, rej) => {
    return setTimeout(res, ms)
  })
}

const downloadImage = async path => {
  const promise = new Promise((res, rej) => {
    got.stream(MOVIEDB_BASE_URI + path)
       .on('end', res)
       .pipe(fs.createWriteStream(IMAGE_PATH + path))
  })
  return promise
}

const recurrent = (array, accumulator, idx) => {
  return async (res, rej) => {
    if (idx % 100 === 0) {
      console.log('Movie #' + idx)
      console.log('Time passed:' + ((Date.now() - time) / 1000) + 'seconds')
      console.log('Still missing: ' + (array.length - idx) + 'movies.')
      console.log('\n\n')
      const jsonified = JSON.stringify(accumulator, undefined, 4)
      fs.writeFileSync('./temp.json', jsonified)
      time = Date.now()
    }

    if (idx % 1000 === 0) {
      const jsonified = JSON.stringify(accumulator, undefined, 4)
      fs.writeFileSync(`./temp_${idx}.json`, jsonified)
    }

    const obj = JSON.parse(array[idx])
    const uri = `https://api.themoviedb.org/3/movie/${obj.id}?api_key=${MOVIEDB_KEY}`
    const results = await got(uri)
    const movie = JSON.parse(results.body)
    if (movie.poster_path) {
      await downloadImage(movie.poster_path)
    }
    const newAccumulator = [ ...accumulator, movie ]
    const newIdx = idx + 1
    await sleep(DELAY)
    return newIdx < array.length
      ? recurrent(array, newAccumulator, newIdx)(res, rej)
      : res(accumulator)
  }
}

const getAllValues = async array => {
  const idx = 0
  const accumulator = []
  const promise = new Promise((res, rej) => (
    recurrent(array, accumulator, idx)(res, rej)
  ))
  time = Date.now()
  const results = await promise
  return results
}

const movieDb = async () => {
  const file = fs.readFileSync('./movie_db.json')
  const json = file.toString().split('\n')
  const results = await getAllValues(json)
  const jsonified = JSON.stringify(results, undefined, 4)
  fs.writeFileSync('./results.json', jsonified)
  console.log('Done!')
}

movieDb()
