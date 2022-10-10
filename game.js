class Game{
  constructor(){
    this.players = [];
    this.turn = 0;
    this.dir = 1;
    this.color = 'red';
    this.number = 0;
    this.playing = false;
  }
  isPlaying(){
    return !this.waiting;
  }
  setColor(color){
    this.color = color;
  }
  setReady(user){
    if (user != -1){
      this.players[user].setReady();
    }
    var count = 0
    for (var p of this.players){
      if (p.isReady()){
        count += 1;
      }
    }
    if (count == this.players.length){
      this.playing = true;
      return -1;
    }
    else{
      return [count, this.players.length];
    }
  }
  reverse(){
    this.dir *= -1;
  }
  stopWaiting(){
    this.waiting = false;
  }
  addPlayer(p){
    this.players.push(p);
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
    if(n == this.turn && !this.waiting){
      this.players[n].getNewCard();
      this.turn = this.nextPlayer();
      return true;
    }
    return false;
  }
  checkMove(cid, user){
    var c = {};
    var gc = false;
    if(user == this.turn && !this.waiting){
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
        this.waiting = true;
        addFour(this);
      }
      else if(cid.includes('color')){
        this.waiting = true;
        c.type = 'color';
        success = true;
        this.number = -5;
        gc = true;
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
        g.number = -4;
        gc = true;
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
        var t = this.turn;
        if(skipExtra)
          this.turn = this.nextPlayer();
        this.players[this.turn].removeCard(c);
        this.turn = this.nextPlayer();
        if(gc)
          return "getColor" + t;
        return c;
      }
    }
    return false;
  }
}

module.exports = {
  Game,
};