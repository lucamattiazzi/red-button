const fs = require('fs')

const baseJson = JSON.parse(fs.readFileSync('./results.json').toString())

const keys = [
  'adult',
  'budget',
  'genres',
  'id',
  'imdb_id',
  'original_language',
  'original_title',
  'overview',
  'popularity',
  'poster_path',
  'release_date',
  'revenue',
  'runtime',
  'spoken_languages',
  'tagline',
  'title',
  'vote_average',
  'vote_count',
]

const total = baseJson.map(row => {
  const values = keys.reduce((acc, k) => {
    if (k === 'genres') {
      const genres = row[k].map(g => g.name)
      return {
        ...acc,
        [k]: genres.join('-'),
      }
    } else if (k === 'spoken_languages'){
      const langs = row[k].map(g => g.name)
      return {
        ...acc,
        [k]: langs.join('-'),
      }
    } else if (k === 'id'){
      return {
        ...acc,
        [k]: row[k].toString(),
      }
    }
    } else {
      return {
        ...acc,
        [k]: row[k],
      }
    }
  }, {})
  return JSON.stringify(values)
})

debugger

fs.writeFileSync('./results-lines.json', total.join('\n'))
