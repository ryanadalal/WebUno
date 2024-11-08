#WEB BASED UNO

The rules follow standard uno rules.
When users navigate to the site they will be prompted to sign in. If there is a game currently running they will be asked if they want to join that game. If there is no game, they will enter a waiting lobby that will not proceed to play until all active players click ready. The game saves players' states so even if they get disconnected or leave the site temporarily, when they return they can resume their last position by resigning in with google.

##Features
*Uses google auth for player accounts
*Waiting lobby
*Can be played over the web using ngrock

##To run with ngrock 
* use $"./ngrok" http 3000
* have change forwarding adress

##To run locally
* http://127.0.0.1:3000/
