const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')
const {generateMessage, generateLocationMessage} = require('./utils/messages')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
// let count = 0;
io.on('connection', (socket) => {
    console.log('New websocket connection')
    // socket.emit('updatedCount', count)
    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('updatedCount', count)
    //     io.emit('updatedCount', count)
    // })

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('welcomeMessage', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('welcomeMessage', generateMessage('Admin',`${user.username} has joined.`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()

    })
    socket.on('chatMessage', (message, callback) => {

        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }
        io.to(user.room).emit('welcomeMessage', generateMessage(user.username,message))
        callback()
    })
    socket.on('sendLocation', (pos, callback) => {
        const userLocation = getUser(socket.id)
        io.to(userLocation.room).emit('locationMessage', generateLocationMessage(userLocation.username,`https://google.com/maps?q=${pos.lat},${pos.longs}`))
        callback(pos.lat)
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log('user ', user)
        if (user) {
            console.log(user.room)
            io.to(user.room).emit('welcomeMessage', generateMessage('Admin',`${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})

app.use(express.static(publicDirectoryPath))


server.listen(port, () => {
    console.log('server is up on port ' + port)
})
