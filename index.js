const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'Buffer Buzzer'

let data = {
  users: new Set(),
  buzzes: new Set(),
  buzzerEnabled: true,
}

const getData = () => ({
  users: [...data.users],
  buzzes: [...data.buzzes].map(b => {
    const [ name, team ] = b.split('-')
    return { name, team }
  }),
  buzzerEnabled: data.buzzerEnabled,
})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

io.on('connection', (socket) => {
  socket.emit('buzzerState', data.buzzerEnabled)

  socket.on('join', (user) => {
    data.users.add(user.id)
    io.emit('active', [...data.users].length)
    console.log(`${user.name} joined!`)
  })

  socket.on('buzz', (user) => {
    if (!data.buzzerEnabled) return

    data.buzzes.add(`${user.name}-${user.team}`)
    io.emit('buzzes', [...data.buzzes])
    console.log(`${user.name} buzzed in!`)
  })

  socket.on('clear', () => {
    data.buzzes = new Set()
    io.emit('buzzes', [...data.buzzes])
    console.log(`Clear buzzes`)
  })

  socket.on('setBuzzerEnabled', (enabled) => {
    if (typeof enabled !== 'boolean') return

    data.buzzerEnabled = enabled
    io.emit('buzzerState', data.buzzerEnabled)
    console.log(`Buzzer ${enabled ? 'enabled' : 'disabled'}`)
  })
})

server.listen(8090, () => console.log('Listening on 8090'))
