const users = [];
// addusers, removeUsers, getUsers, getUsersInRoom

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase()

    if(!username || !room) {
        return {
            error: 'username or room is empty'
        }
    }

    //check duplicate username:
    const existingUser  = users.find(user => user.username === username && user.room === room)
    if(existingUser){
        return {
            error: 'Already user'
        }
    }
    const user = {id, username, room}
    users.push(user)
    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter(user => user.room === room.trim().toLowerCase())
}

// addUser({
//     id: 22,
//     username: 'Nirajan Karki',
//     room: 'Hraa'
// })
//
// addUser({
//     id: 33,
//     username: 'Hari Bahdure',
//     room: 'Hraa'
// })
//
// addUser({
//     id: 13,
//     username: 'Chin lal',
//     room: 'Roo'
// })
// console.log(getUsersInRooms('Hraa'))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
