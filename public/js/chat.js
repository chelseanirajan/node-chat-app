const socket = io()

// socket.on('updatedCount', (count) => {
//     console.log('Count down is now updated s', count)
// })
//
// document.querySelector('#increment').addEventListener('click', () =>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

const $messages = document.querySelector('#messages')
// Template


const messagesTemplate = document.querySelector('#message-template').innerHTML

// Query
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    // new Message Element
    const $newMessage = $messages.lastElementChild

    //height of the new element
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('welcomeMessage', (message) => {
    const html = Mustache.render(messagesTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// /const $locationMessage = document.querySelector('$messages');
//Template
const $locationMessageT = document.querySelector('#location-message').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render($locationMessageT, {
        username: message.username,
        message: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

const chatForm = document.querySelector('#formId');
const chatInput = chatForm.querySelector('input')
const chatButton = chatForm.querySelector('button')


chatForm.addEventListener('submit', (event) => {
    chatButton.setAttribute('disabled', 'disabled')
    event.preventDefault()
    // const chatMessage = chatValue.value;
    const chatMessage = event.target.elements.message.value
    socket.emit('chatMessage', chatMessage, (error) => {
        chatButton.removeAttribute('disabled')
        chatInput.value = ''
        chatInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

const $locationSave = document.querySelector('#location-save')
$locationSave.addEventListener('click', () => {
    $locationSave.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geo location is not supported by your user')
    }
    navigator.geolocation.getCurrentPosition(position => {

        socket.emit('sendLocation', {lat: position.coords.latitude, longs: position.coords.longitude}, (la) => {
            console.log('Location delivered successfully! ' + la)
            $locationSave.removeAttribute('disabled')
        })
    })
})
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on('serverMessage', (serverMessage) => {
    console.log(serverMessage)
})

