var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

THREE = require("three");

var players = [];

io.on('connection', function(socket){
	
	var p2 = Math.PI * 2;
	
	var i = players.length;
	
	socket.emit('connection accepted', i);
	socket.player_id = i;
	
	var player = new THREE.Object3D;
	player.pid = i;
	player.socket = socket;
	player.position.x = i * 5;
	player.velocity = new THREE.Vector3(0,0,0);
	player.thrust = 0;
	player.torque = {x:0,y:0};
	
	players.push(player);
	
	socket.broadcast.emit('new player', [i, player.position, player.rotation]);
	
	socket.on("connection accepted ok", function(){
		for(var j = 0; j < players.length; j++) {
			if(players[j] != false)
			socket.emit("new player", [j, players[j].position, players[j].rotation]);
		}
	});
	
	socket.on("mousemove", function(args){
		var mx = args[1][0];
		var my = args[1][1];
		var w = args[2][0];
		var h = args[2][1];
		var player = players[args[0]];
		player.torque.x = -mx/w + 0.5;
		player.torque.y = -my/h + 0.5;
		
		if(Math.abs(player.torque.x) < 0.0125) player.torque.x = 0;
		if(Math.abs(player.torque.y) < 0.0125) player.torque.y = 0;
		
		io.emit("player update", [args[0], "torque", player.torque]);
	});

	socket.on("keydown", function(args){
		if(args[1] == 38) {
			players[args[0]].thrust = 1;
			io.emit("player update", [args[0], "thrust", 1]);
		}
	});
	
	socket.on("keyup", function(args){
		if(args[1] == 38) {
			players[args[0]].thrust = 0;
			io.emit("player update", [args[0], "thrust", 0]);
		}
	});
	
  socket.on('disconnect', function(e,k){
    console.log('user disconnected');
	io.emit("remove player", this.player_id);
	players[this.player_id] = false;
  });
});
var time = new Date().getTime();
var lastTime = time;
var runtime = 0;
function animate() {
	runtime = (new Date().getTime() - time)/1000;
	
	var dt = runtime = lastTime;
	lastTime = runtime;
	
	for(var i = 0; i < players.length; i++) {
		var acceleration = new THREE.Vector3( 0, 0, -1 );
		acceleration.applyQuaternion( players[i].quaternion );
		
		acceleration.multiplyScalar(players[i].thrust[1] * dt);
		
		players[i].velocity.add(acceleration);
		players[i].position.add(players[i].velocity.clone().multiplyScalar(dt));
	}
	
	
}

animate();

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.render('game', { title: 'Game' });
});

module.exports = app;
