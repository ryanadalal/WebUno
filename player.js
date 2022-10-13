
class Player{
  constructor(name, ID, pNum){
    this.cards = [];
    this.name = name;
    this.ID = ID;
    this.pNum = pNum;
    this.ready = false;
    for(var i = 0; i < 7; i ++){
      this.getNewCard();
    }
  }
  getpNum(){
    return this.pNum;
  }
  getID(){
    return this.ID;
  }
  setReady(){
    this.ready = true;
  }
  isReady(){
    return this.ready;
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
    var done = false;
    function checkCardsSame(c1, c2){
      for(let key in c1){
        if(!(key in c2 )) 
          return false;
        if(c1[key]!==c2[key])
          return false;
      }
      if(!done){
        done = true;
        return true;
      }
      else{
        return false;
      }
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

module.exports = {
  Player,
};