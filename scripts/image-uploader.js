const fs = require('fs')
const Storage = require('@google-cloud/storage')
const FOLDER = './images'

const sleep = ms => {
  return new Promise((res, rej) => {
    return setTimeout(res, ms)
  })
}

const storage = new Storage({
  projectId: 'movie-posters',
  keyFilename: './admin.json',
})
const storeBucket = storage.bucket('movie-posters')

const upload = (jdx = 1) => {
  fs.readdir(FOLDER, (err, files) => {
    files.forEach((fileName, idx) => {
      if (
        idx > 100 * jdx ||
        idx < 100 * (jdx - 1) ||
        fileName.slice(-3) !== 'jpg'
      ) return
      const file = storeBucket.file(fileName)
      const blobStream = file.createWriteStream({
        metadata: {
          contentType: 'image/jpg'
        }
      })
      const stream = fs.createReadStream(FOLDER + '/' + fileName)
      stream.on('end', () => {
      })
      stream.on('error', err => {
        console.log(err)
      })
      stream.pipe(blobStream)
    })
  })
}

const uploader = async () => {
  for(let i=52; i < 133; i++){
    upload(i)
    console.log(i)
    await sleep(10000)
  }
}

uploader()
