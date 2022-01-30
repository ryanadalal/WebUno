const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

var turn = 0;
var dir = 1;
var players = [];
function nextPlayer(){
  if (dir == -1 && turn == 0)
    turn = players.length - 1;
  else if(dir == 1 && turn == players.length + 1)
    turn = 0;
  else
    turn += dir;
}
function getNewCard(){
  var r = Math.floor(Math.random() * 55);
  var c = {};
  if (r < 10){
    c.type = 'normal';
    c.color = 'blue';
    c.number = r;
  }
  else if (r < 20){
    c.type = 'normal';
    c.color = 'red';
    c.number = r - 10;
  }
  else if (r < 30){
    c.type = 'normal';
    c.color = 'green';
    c.number = r - 20;
  }
  else if (r < 40){
    c.type = 'normal';
    c.color = 'yellow';
    c.number = r - 30;
  }
  else if (r < 44){
    c.type = '+2';
    c.color = (r == 40) ? 'green' : (r == 41) ? 'yellow' : (r == 42) ? 'red' : 'blue';
  }
  else if (r < 48){
    c.type = 'skip';
    c.color = (r == 44) ? 'green' : (r == 45) ? 'yellow' : (r == 46) ? 'red' : 'blue';
  }
  else if (r < 52){
    c.type = 'reverse';
    c.color = (r == 48) ? 'green' : (r == 49) ? 'yellow' : (r == 50) ? 'red' : 'blue';
  }
  else if (r == 53){
    c.type = '+4';
  }
  else{
    c.type = 'color';
  }
}

app.use(express.static(__dirname + '/client'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', socket => {
  io.emit('reset');
  socket.on('disconnect', () => {
    io.emit('reset');
  });
  socket.on('box', (num) => {
      io.emit('madeMove', { spot: num, xoro: turn }); 
      turn = (turn == 'x') ? 'o' : 'x';
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});