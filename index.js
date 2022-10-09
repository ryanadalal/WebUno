var express = require('express');
var app = express();
var server = require('http').createServer(app);
const session = require('express-session');

const { Server } = require("socket.io");
const io = new Server(server);
app.set('view engine', 'ejs');

const {Game} = require('./game');
const {Player} = require('./player');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.use(express.static(__dirname + '/views'));


//const sharedsession = require("express-socket.io-session");

const passport = require('passport');
const { send } = require("process");

var userProfile;

const dotenv = require('dotenv');
const { type } = require('express/lib/response');
dotenv.config();

const port = process.env.PORT;
server.listen(port, () => {
  console.log('Game server running: ');
});

app.get('/', function(req, res) {
  res.render('auth');
});

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => {
  res.render('lobby', {user: userProfile});
});

app.get('/play', (req, res) => {
  res.render('game', {user: userProfile});
});

app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"//"http://c97e-100-2-35-76.ngrok.io/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    console.log("new player connected");
    // Successful authentication, redirect success.
    res.redirect('/success');
});

var pNum = 0;
var game;
var players = [];
io.on('connection', socket => {
  io.emit('reset');
  io.emit('number', pNum);
  pNum ++;
  players.push(new Player(userProfile.displayName));
  game = new Game(players);
  sendCards({type: 'normal', color: game.color, number: game.number});
  socket.on('disconnect', () => {
    io.emit('reset');
  });
  socket.on('readied', (user) => {
    allready = game.setReady(user);
    if (allready == -1){
      io.emit('redirect', '/play');
    }
    else{
      io.emit('playerreadied', allready);
    }
  });
  socket.on('cardClicked', (cid, user) => {
    //implement code for when a card is clicked
    var checkedMove = game.checkMove(cid, user);
    if (checkedMove){
      if(typeof(checkedMove) == "string" && checkedMove.includes("getColor"))
        getColor(parseInt(checkedMove[checkedMove.length - 1]));
      else
        sendCards(checkedMove);
    }
  });
  socket.on('takeCard', (number) => {
    //implement code for when a card is clicked
    var drewCard = game.drawCard(number);
    if(drewCard){
      sendCards();
    }
  });
  socket.on('selectedColor', (color) => {
    //implement code for when a card is clicked
    game.stopWaiting();
    game.setColor(color);
    if(game.number == -4){
      sendCards({type: '+4', color: color});
    }
    else if(game.number == -5){
      sendCards({type: 'color', color: color});
    }
  });
});
function sendCards(cid){
  var cardList = [];
  var names = [];
  for(var i = 0; i < game.players.length; i ++){
    cardList.push(game.players[i].outputCards());
    names.push(game.players[i].name);
  }
  io.emit('currentCard', cid, game.turn);
  io.emit('cardList', cardList, names);
}
function getColor(num){
  io.emit('pickColor', num);
}
