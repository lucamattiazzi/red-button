const fs = require('fs')
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient({
  keyFilename: './admin.json',
  projectId: 'converge18-mil-4001'
})
const pEachSeries = require('p-each-series')
const pMap = require('p-map')

const FOLDER = './images'

const detect = async fileName => {
  const file = fs.readFileSync(FOLDER + '/' + fileName)
  const res = await client.imageProperties(file)
  const colors = res[0].imagePropertiesAnnotation.dominantColors.colors
  const json = {
    poster_path: '/' + fileName,
    colors: colors.map(c => JSON.stringify(c.color)).join('-'),
  }
  const string = JSON.stringify(json)
  console.log(string)
  return string
}

fs.readdir(FOLDER, (err, files) => {
  const filenames = files.filter(f => f.slice(-3) === 'jpg')
  pMap(filenames, detect, { concurrency: 8 }).then(() => {})
})
