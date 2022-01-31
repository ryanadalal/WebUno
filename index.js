const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + '/client'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

var pNum = 0;
var game;
var players = [];
io.on('connection', socket => {
  io.emit('reset');
  io.emit('number', pNum);
  pNum ++;
  players.push(new Player());
  game = new Game(players);
  sendCards();
  socket.on('disconnect', () => {
    io.emit('reset');
  });
});
function sendCards(){
  var cardList = [];
  for(var i = 0; i < players.length; i ++)
    cardList.push(players[i].outputCards());
  io.emit('cardList', cardList)
}

class Game{
  constructor(players){
    this.players = players;
    this.turn = 0;
    this.dir = 0;
    this.color = 'red';
    this.number = 0;
  }
  reverse(){
    this.dir *= -1;
  }
  nextPlayer(){
    if (this.dir == -1 && this.turn == 0)
      this.turn = this.players.length - 1;
    else if(this.dir == 1 && this.turn == this.players.length + 1)
      this.turn = 0;
    else
      this.turn += dir;
  }
  run(){
    
  }
}

class Player{
  constructor(){
    this.cards = [];
    for(var i = 0; i < 7; i ++){
      this.getNewCard();
    }
  }
  outputCards(){
    return this.cards;
  }
  take4(){
    for(var i = 0; i < 4; i ++)
      this.getNewCard();
  }
  take2(){
    this.getNewCard();
    this.getNewCard();
  }
  getNewCard(){
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
    this.cards.push(c);
  }
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});