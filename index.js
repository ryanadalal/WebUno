const express = require("express");
const app = express();

const http = require("http");
const { send } = require("process");
const server = http.createServer(app);

const { Server } = require("socket.io");
const { checkServerIdentity } = require("tls");
const { threadId } = require("worker_threads");
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
  socket.on('cardClicked', (cid, user) => {
    //implement code for when a card is clicked
    game.checkMove(cid, user);
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
      return this.players.length - 1;
    else if(this.dir == 1 && this.turn == this.players.length + 1)
      return 0;
    else
      return this.turn + dir;
  }
  checkMove(cid, user){
    if(user == this.turn){
      if(cid.includes(this.color)){
        if (parseInt(cid[cid.length - 1]) != NaN)
          this.number = parseInt(cid[cid.length - 1]);
        else if(cid.includes('+2')){
          this.number = -1;
        }
        else if(cid.includes('reverse')){
          this.number = -2;
        }
        else if(cid.includes('skip')){
          this.number == -3
        }
      }
      else if(cid.includes(this.number)){
        this.color = cid.substring(0, cid.length - 1);
      }
      else if((number == -1 && cid.includes('+2'))){
        this.players(this.nextPlayer()).take2();
        this.color = cid.substring(0, cid.length - 2);
        this.turn = this.nextPlayer();
      }
      else if(number == -2 && cid.includes('reverse')){
        this.reverse();
        this.color = cid.substring(0, cid.length - 7);
      }
      else if(number == -3 && cid.includes('skip')){
        this.color = cid.substring(0, cid.length - 4);
        this.turn = this.nextPlayer();
      }
      else if(cid.includes('+4')){
        this.players(this.nextPlayer()).take4();
        this.turn = this.nextPlayer();
      }
      else if(cid.includes('color')){
        this.turn = this.nextPlayer();
      }
    }
    sendCards();
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