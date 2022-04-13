var express = require('express');
var app = express();


require('./Entity');
require('./client/Inventory');
require('./Database');

var serv = require('http').Server(app);
var mongojs = require("mongojs");
var db = mongojs('localhost:27017/myGame', ['account', 'progress']);
 
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(2000);
console.log("Server started.");
 
var SOCKET_LIST = {};


var DEBUG = true;
 
var USERS = {
	//username:password
	"bob":"asd",
	"bob2":"bob",
	"bob3":"ttt",	
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
 
	socket.on('signIn',function(data){ // client sends us a package aka username and password
		Database.isValidPassword(data,function(res){
			if(!res){
	socket.emit('signInResponse',{success:false});			
			} else{
				Database.getPlayerProgress(data.username, function(progress){

			
				Player.onConnect(socket, data.username, progress);

				socket.emit('signInResponse',{success:true});
			});
			}
		});
	});
	socket.on('signUp',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});		
			} else {
			
				Database.addUser(data,function(){
					socket.emit('signUpResponse',{success:true});					
				});
			}
		});		
	});
 
 
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

 
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});
 
 
 
});

 
 
setInterval(function(){
	
var packs = Entity.getFrameUpdateData();

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',packs.initPack);
		socket.emit('update',packs.updatePack);
		socket.emit('remove',packs.removePack);
	}
	

},1000/25);


/*var profiler = require('v8-profiler-next');
var fs = require('fs');
var startProfiling = function(duration){
	profiler.startProfiling('1', true);
	setTimeout(function(){
		var profile1 = profiler.stopProfiling('1');
		
		profile1.export(function(error, result) {
			fs.writeFile('./profile.cpuprofile', result, (err)  =>   {if (err) { 
    console.log(err); 
  } } );
			profile1.delete();
			console.log("Profile saved.");
		});
	},duration);	
}
startProfiling(10000);
*/




