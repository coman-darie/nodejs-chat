var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msgObj){
          //If the nickname doesn't exists we can display the message that a new user connected
          var nickname = msgObj.from;
          var userMessage = msgObj.message;
          if (!nickname) {
               socket.emit('user msg', 'Please provide first a nickname using command /nickname {your nickname}!');
          } else if (!userMessage) {//When the user is logging to chat, he provides only the nickname and the message is empty
               if (users.hasOwnProperty(nickname)) {//This nickname is already used. We have to check if it's the same socket or different one (the same user or different one)
                    var existingSocket = users[nickname];
                    if (existingSocket.id != socket.id) {
                   
                         console.log('existingSocket.id: ' + existingSocket.id);
                         socket.emit('user msg', "The nickname '" + nickname + "' it's already used. Please use a different nickname!");
                    }
               } else {
                    io.emit('connect msg', nickname + ' user connected');
                    users[nickname] = socket;
               }
          } else {//Both nickname and message are provided
               if (users.hasOwnProperty(nickname)) {//The user is already logged
                    io.emit(
                         'chat message',
                         {
                           from: nickname,
                           message: userMessage
                         }
                    );
               } else {
                    socket.emit('user msg', 'Please provide first a nickname using command /nickname {your nickname}!');
               }
          }
  });

  socket.on('disconnect', function(){
     var offlineUser = 'A user';
     var nicknames = Object.keys(users);
     nicknames.forEach(function(existingNickname) {
          var existingSocket = users[existingNickname];
          if (existingSocket
                    && socket.id == existingSocket.id) {
               offlineUser = existingNickname;
          }
     });
 
    io.emit('disconnect msg', offlineUser + ' has just been disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});