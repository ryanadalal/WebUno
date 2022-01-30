class Game{
  constructor(players){
    this.players = players;
    this.turn = 0;
    this.dir = 0;
  }
  switchDir(){
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
}