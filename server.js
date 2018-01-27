const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const PORT = process.env.PORT || 3000

const markov = require('./markov')

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' })
})

server.listen(PORT, () => {
  console.log('Listening on port ' + PORT)
})

const staticPath = path.join(__dirname, '/public')
app.use(express.static(staticPath))

app.get('/generate', async (req, res) => {
  io.emit('button', { clicked: 'asd' })
  const story = await markov.generate(100)
  io.emit('generate', { text: story })
  res.send(story)
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
