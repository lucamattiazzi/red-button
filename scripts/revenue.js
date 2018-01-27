const imdb = require('imdb-api')
const csv = require('fast-csv')
const fs = require('fs')
const got = require('got')

const MOVIEDB_KEY = process.env.MOVIEDB_KEY
const REVENUE = `https://api.themoviedb.org/3/discover/movie?api_key=${MOVIEDB_KEY}&sort_by=revenue.desc&language=en-US&page=`
const MOVIEDB_BASE_URI = 'https://image.tmdb.org/t/p/w500'
const IMAGE_PATH = './best_images'

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
      const jsonified = JSON.stringify(accumulator, undefined, 4)
      fs.writeFileSync('./best_temp.json', jsonified)
      time = Date.now()
    }
    const uri = `https://api.themoviedb.org/3/movie/${array[idx].id}?api_key=${MOVIEDB_KEY}`
    const results = await got(uri)
    const movie = JSON.parse(results.body)
    if (movie.poster_path) {
      await downloadImage(movie.poster_path)
    }
    const newAccumulator = [ ...accumulator, movie ]
    const newIdx = idx + 1
    // await sleep(DELAY)
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

const bestRevenues = async (start, end) => {
  const results = []
  for (let page = start; page <= end; page++) {
    const uri = REVENUE + page
    const json = await got(uri)
    const movies = JSON.parse(json.body)
    const pageRes = await getAllValues(movies.results)
    results.push(...pageRes)
    const jsonified = JSON.stringify(results, undefined, 4)
    fs.writeFileSync(`./best_results_${page}.json`, jsonified)
    console.log('Page ' + page + ' done!')
  }
  const jsonified = JSON.stringify(results, undefined, 4)
  fs.writeFileSync('./best_results_all.json', jsonified)
  console.log('Done!')
}

bestRevenues(50, 1000)
