const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const path = require('path')


const DATA = []





app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/socket', express.static(path.join(__dirname, 'node_modules', "socket.io", "client-dist")))

app.set('view engine', "ejs")

server.listen(3000, () => console.log(`SERVER LISTEN AT 3000`))

app.get('/', async (req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {
    
    console.log(socket.id, "biz qoshildi");
    
    let id = DATA.find(user => user.id == socket.id)
    if(!id){
        DATA.push({
            id: socket.id
        })
    }
    
    
    socket.on('sign', data => {
        const index = DATA.findIndex(user => user.id == socket.id)
        
        if(DATA[index]["name"]){
            socket.emit('error', {
                message: "Siz ism kiritgansiz"
            })
        } else {
            DATA[index]["name"] = data?.name
            
            socket.emit("logged", DATA.filter(e => e.name))
            
            socket.broadcast.emit('new_member', {
                id: socket.id,
                name: data.name
            })
        }
        
        // socket.emit('logged', {
        //     logged: true
        // })
    })
    
    
    socket.on('disconnect', () => {
        let index = DATA.findIndex(user => user.id == socket.id)
        DATA.splice(index, 1)
        console.log(socket.id, "bizni tark etdi");
        
        socket.broadcast.emit('left_member', {
            id: socket.id,
        })        
    });

    socket.on('new_message', data => {
        let index = DATA.findIndex(user => user.id == socket.id)
        if(DATA[index]["name"]){
            socket.broadcast.emit('new_message', {
                owner: DATA[index]["name"],
                message: data.message
            })
        }
    })
})