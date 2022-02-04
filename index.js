const express = require("express");
const app = express();

const http = require("http");
const { send } = require("process");
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
  sendCards({type: 'normal', color: game.color, number: game.number});
  socket.on('disconnect', () => {
    io.emit('reset');
  });
  socket.on('cardClicked', (cid, user) => {
    //implement code for when a card is clicked
    game.checkMove(cid, user);
  });
  socket.on('takeCard', (number) => {
    //implement code for when a card is clicked
    game.drawCard(number);
  });
});
function sendCards(cid){
  var cardList = [];
  for(var i = 0; i < game.players.length; i ++)
    cardList.push(game.players[i].outputCards());
  io.emit('currentCard', cid);
  io.emit('cardList', cardList);
}

class Game{
  constructor(players){
    this.players = players;
    this.turn = 0;
    this.dir = 1;
    this.color = 'red';
    this.number = 0;
  }
  reverse(){
    this.dir *= -1;
  }
  nextPlayer(){
    if (this.dir == -1 && this.turn == 0){
      return this.players.length - 1;
    }
    else if(this.dir == 1 && this.turn == this.players.length - 1){
      return 0;
    }
    else{
      return this.turn + this.dir;
    }
  }
  drawCard(n){
    if(n == this.turn){
      this.players[n].getNewCard();
      this.turn = this.nextPlayer();
      sendCards();
    }
  }
  checkMove(cid, user){
    var c = {};
    if(user == this.turn){
      var success = false;
      if(cid.includes(this.color)){
        c.color = this.color;
        if (!isNaN(parseInt(cid[cid.length - 1])) && cid[cid.length - 2] != '+'){
          this.number = parseInt(cid[cid.length - 1]);
          c.type = 'normal';
          c.number = this.number;
        }
        
        else if(cid.includes('+2')){
          addTwo(this);
        }
        else if(cid.includes('reverse')){
          reverseOrder(this);
        }
        else if(cid.includes('skip')){
          skipNext(this);
        }
        success = true;
      }
      else if(cid.includes(this.number)){
        this.color = cid.substring(0, cid.length - 1);
        c.number = this.number;
        c.color = this.color;
        c.type = 'normal';
        success = true;
      }
      else if(this.number == -1 && cid.includes('+2')){
        addTwo(this);
      }
      else if(this.number == -2 && cid.includes('reverse')){
        reverseOrder(this);
      }
      else if(this.number == -3 && cid.includes('skip')){
        skipNext(this);
      }
      else if(cid.includes('+4')){
        addFour(this);
      }
      else if(cid.includes('color')){
        c.type = 'color';
        success = true;
      }
      var skipExtra = false;
      function addTwo(g){
        g.number = -1;
        g.players[g.nextPlayer()].take2();
        g.color = cid.substring(0, cid.length - 2);
        c.color = g.color;
        c.type = '+2';
        skipExtra = true;
        success = true;
      }
      function addFour(g){
        g.players[g.nextPlayer()].take4();
        c.type = '+4';
        skipExtra = true;
        success = true;
      }
      function reverseOrder(g){
        g.number = -2;
        g.reverse();
        g.color = cid.substring(0, cid.length - 7);
        c.color = g.color;
        c.type = 'reverse';
        success = true;
      }
      function skipNext(g){
        g.number == -3;
        g.color = cid.substring(0, cid.length - 4);
        c.color = g.color;
        c.type = 'skip';
        skipExtra = true;
        success = true;
      }
      if(success){
        if(skipExtra)
          this.turn = this.nextPlayer();
        this.players[this.turn].removeCard(c);
        this.turn = this.nextPlayer();
        sendCards(c);
      }
    }
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
  removeCard(c){
    function checkCardsSame(c1, c2){
      for(let key in c1){
        if(!(key in c2 )) 
          return false;
        if(c1[key]!==c2[key])
          return false;
      }
      return true;
    }
    this.cards = this.cards.filter(function(index){
      return !checkCardsSame(index, c);
    });
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