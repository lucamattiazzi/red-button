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

const total = baseJson.reduce((acc, row, idx) => {
  const values = keys.map(k => {
    if (k === 'genres') {
      const genres = row[k].map(g => g.name)
      return genres.join('-').replace
        ? genres.join('-').replace(/"/g, '`').replace(/;/g, '.').replace(/\n/g, '\t')
        : genres.join('-')
    } else if (k === 'spoken_languages'){
      const langs = row[k].map(g => g.name)
      return langs.join('-').replace
        ? langs.join('-').replace(/"/g, '`').replace(/;/g, '.').replace(/\n/g, '\t')
        : langs.join('-')
    } else {
      return row[k]
        ? row[k].replace
          ? row[k].replace(/"/g, '`').replace(/;/g, '.').replace(/\n/g, '\t')
          : row[k]
        : ''
    }
  })
  const joined = '"' + values.join('";"') + '"'
  return [
    ...acc,
    '"' + values.join('";"') + '"',
  ]
}, ['"' + keys.join('";"') + '"'])

fs.writeFileSync('./results.csv', total.join('\n'))
