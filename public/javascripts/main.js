"use strict";

function init() {
	var socket = io();
	var MY_ID = -1;
		
	socket.on('connection accepted', function(PID){
		ShaderLoader.loadShaders(["sky.vert", "sky.frag", "shield.vert", "shield.frag"], function(){
			var game = new Game(ShaderLoader.shaders);
			MY_ID = PID;
			game.start(MY_ID);
			
			socket.emit("connection accepted ok");
			
			socket.on('new player', function(args){
				console.log("mew");
				game.addPlayer(args[0], args[1], args[2]);
			});
			
			socket.on('remove player', function(pid){
				game.removePlayer(pid);
			});
			
			socket.on("player update", function(args){
				game.updatePlayer(args[0], args[1], args[2]);
			});
		});
	});
	var keys = [];
	window.addEventListener("keydown", function(e) {
		if(typeof keys[e.which] == "undefined" || keys[e.which] != true) {
			keys[e.which] = true;
			socket.emit("keydown", [MY_ID, e.which]);
		}
	});
	window.addEventListener("keyup", function(e) {
		keys[e.which] = false;
		socket.emit("keyup", [MY_ID, e.which]);
	});
	window.addEventListener("mousemove", function(e) {
		socket.emit("mousemove", [MY_ID, [e.clientX, e.clientY], [window.innerWidth, window.innerHeight]]);
	});
}

var ShaderLoader = {
	shaders : {},
	shaders_loaded : 0,
	loadShaders : function(shader_names, callback) {
		shader_names.forEach(function(name,i){
			Util.loadFile("shaders/"+name, function(text){
				ShaderLoader.shaders[name] = text;
				if(++ShaderLoader.shaders_loaded == shader_names.length) {
					callback();
				}
			});
		});
	}
}

var Util = {
	loadFile : function(url, callback) {
		var xmlhttp;
		if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else { // code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				callback(xmlhttp.responseText);
			}
		}
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}
}

/*




var w = 10;
var h = 10;
var l = 10;

var start_time = now();
var runtime = 0;

var shield_radius = 9;

var projectile_speed = 100.0;

var hit = 1.0;

var velocity = new THREE.Vector3(0,0,0);

var projectileGeometry = new THREE.SphereGeometry(0.1);
var projectileMaterial = new THREE.MeshBasicMaterial({
	color : 0xff0000
});

var thrust = 0;

var ship = new THREE.Mesh(new THREE.SphereGeometry(1,32,32), new THREE.MeshBasicMaterial({
	color : 0xffffff,
	opacity : 0.5,
	transparent : true,
	depthWrite : false
}));

var positions = new Float32Array(w*h*l*3);
var colors = new Float32Array(w*h*l*4);

var botGeometry = new THREE.BoxGeometry(1,1,1);
var botMaterial = new THREE.MeshBasicMaterial({
	color : 0xff0000
});
var bots = [];
var radarbots = [];

var droneFireTimer = setInterval(function(){
	for(var i = 0; i < bots.length; i++) {
		bots[i].fire();
	}
}, 300);

var p = 0;
var pp = 0;
for(var x = 0; x < w; x++) {
	for(var y = 0; y < h; y++) {
		for(var z = 0; z < l; z++) {
			positions[p++] = x-4.5;
			positions[p++] = y-4.5;
			positions[p++] = z-4.5 - 100;
			var grey = Math.random() * 0.25 + 0.5;
			colors[pp++] = grey;
			colors[pp++] = grey;
			colors[pp++] = grey;
			colors[pp++] = 1.0;
		}
	}
}

var geometry = new THREE.BufferGeometry();
geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.addAttribute("color", new THREE.BufferAttribute(colors, 4));

var carrier = new THREE.Mesh(new THREE.BoxGeometry(10,10,10,1,1,1), new THREE.MeshBasicMaterial({
	color : 0x999999
}));
carrier.position.z = -100;

var cooldown = 0;

var projectiles = [];

var KEYS = [];

var torqueX = 0;
var torqueY = 0;

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.autoClear = false;
renderer.enableScissorTest(true);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var hitpositions = new Float32Array(128*3);
var hittimes = new Float32Array(128);
for(var i = 0; i < 128; i++) hittimes[i] = 0;

scene.add(ship);

scene.add(carrier);


pCamera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1.0, 1000000);
rCamera = new THREE.PerspectiveCamera(60, 1, 1.0, 1000000);


scene.add(pCamera);

radarScene = new THREE.Scene();
radarScene.add(rCamera);


radarCarrier = new THREE.Mesh(carrier.geometry.clone(), new THREE.MeshBasicMaterial({
	color : 0xff0000
}));
radarShip = new THREE.Mesh(ship.geometry.clone(), new THREE.MeshBasicMaterial({
	color : 0x0000ff
}));
radarShip.position.copy(ship.position);
radarCarrier.position.copy(carrier.position);
radarScene.add(radarCarrier);
radarScene.add(radarShip);
window.addEventListener("keydown", function(e){
	KEYS[e.which] = true;
	if(e.which == 48) viewMode = 1 - viewMode;
	if(e.which == 187) addDrone();
});
window.addEventListener("keyup", function(e){
	KEYS[e.which] = false;
});
window.addEventListener("mousemove", function(e){
	torqueY = e.clientX/window.innerWidth - 0.5;
	torqueX = e.clientY/window.innerHeight - 0.5;
	if(Math.abs(torqueX) < 0.025) torqueX = 0;
	if(Math.abs(torqueY) < 0.025) torqueY = 0;
});

var next_hit = 0;


var pLocal = new THREE.Vector3( 0, 0, -1000 );
var direction;
var acceleration;
var last_time = now();
var viewMode = 0;

loadShaders(function(){
	
	var socket = io();
	
	socket.on('connection accepted', function(){
		depends();
		animate();
	});
});

function depends() {
	shieldMaterial = new THREE.ShaderMaterial({
		vertexShader : shaders["shield.vert"],
		fragmentShader : shaders["shield.frag"],
		transparent : true,
		uniforms : {
			radius : { type : "f", value : shield_radius },
			hitposition : { type : "3fv", value : hitpositions },
			hittime : { type : "fv1", value : hittimes },
			hits : { type : "i", value : 0 },
			time : { type : "f", value : runtime }
		},
		blending : THREE.AdditiveBlending,
		side : THREE.DoubleSide,
		depthWrite : false
	});

	shield = new THREE.Mesh(new THREE.SphereGeometry(shield_radius,64,64), shieldMaterial);
	shield.position.z = -100;
	shield.position.x = 0;
	shield.position.y = 0;
	scene.add(shield);
}

function animate() {
	
	runtime = (now() - start_time)/1000;
	
	//document..text(thrust);
	var dt = (now() - last_time)/1000;
	last_time = now();
	for(var i = 0; i < bots.length; i++) {
		bots[i].position.add(bots[i].velocity.clone().multiplyScalar(dt));
	}
	
	ship.rotateY(-torqueY * 0.05);
	ship.rotateX(-torqueX * 0.05);
	
	acceleration = new THREE.Vector3( 0, 0, -1 );
	acceleration.applyQuaternion( ship.quaternion );
	direction = acceleration.clone();
	
	acceleration.multiplyScalar(thrust * dt);
	
	velocity.add(acceleration);
	ship.position.add(velocity.clone().multiplyScalar(dt));
	handleKeys();
	
	for(var i = 0; i < projectiles.length; i++) {
		projectiles[i].position.x += projectiles[i].velocity.x * dt;
		projectiles[i].position.y += projectiles[i].velocity.y * dt;
		projectiles[i].position.z += projectiles[i].velocity.z * dt;
		projectiles[i].travelled += 0.01;

		if(projectiles[i].travelled > 4.0) {
			scene.remove(projectiles[i]);
			projectiles.splice(i, 1);
		}
	}
		
	checkProjectileHits();
	shieldMaterial.uniforms.time.value = runtime;
	shieldMaterial.uniforms.time.needsUpdate = true;
	
	pCamera.position.x = ship.position.x;
	pCamera.position.y = ship.position.y;
	pCamera.position.z = ship.position.z;
	pCamera.rotation.x = ship.rotation.x;
	pCamera.rotation.y = ship.rotation.y;
	pCamera.rotation.z = ship.rotation.z;
	
	rCamera.position.x = ship.position.x;
	rCamera.position.y = ship.position.y;
	rCamera.position.z = ship.position.z;
	rCamera.rotation.x = ship.rotation.x;
	rCamera.rotation.y = ship.rotation.y;
	rCamera.rotation.z = ship.rotation.z;
	
	//rCamera.rotateX(-Math.PI/2);
	rCamera.translateZ(200);
	
	radarCarrier.position.copy(carrier.position);
	radarShip.position.copy(ship.position);
	
	if(viewMode == 1) {
		pCamera.translateZ(12);
		ship.visible = true;
	} else {
		ship.visible = false;
	}
	
	renderer.setViewport(0,0,window.innerWidth, window.innerHeight);
	renderer.setScissor(0,0,window.innerWidth, window.innerHeight);
	renderer.render(scene, pCamera);
	
	renderer.setViewport(0,0,256,256);
	renderer.setScissor(0,0,256,256);
	renderer.clear();
	renderer.render(radarScene, rCamera);
	
	rCamera.translateZ(-200);
	rCamera.rotateX(-Math.PI/2);
	rCamera.translateZ(200);
	
	renderer.setViewport(257,0,256,256);
	renderer.setScissor(257,0,256,256);
	renderer.clear();
	renderer.render(radarScene, rCamera);
	
	requestAnimationFrame(animate);
}


function now(){
	return new Date().getTime();
}


function addDrone() {
	var bot = new THREE.Mesh(botGeometry, botMaterial);
	bot.fire = function() {
		var p1 = ship.position.clone();
		var p2 = bot.position.clone();
		var v_target = bot.velocity.clone().sub(velocity);
		
		var d1 = p1.clone().sub(p2);
		
		var a = v_target.x*v_target.x + v_target.y*v_target.y + v_target.z*v_target.z - projectile_speed*projectile_speed;
		var b = 2 * (v_target.x*d1.x + v_target.y*d1.y + v_target.z*d1.z);
		var c = d1.x*d1.x + d1.y*d1.y + d1.z*d1.z;
		
		if(b*b < 4*a*c) {
			console.log("error");
		}
		
		var p = -b/(2*a);
		var q = Math.sqrt(b*b - 4*a*c)/(2*a);
		
		var t1 = p-q;
		var t2 = p+q;
		
		if(t1 < 0 && t2 < 0) {
			console.log("error2");
		}
		if(t1 > t2) t = t2;
		else t = t1;
		
		var hugo = d1.clone().add(v_target.multiplyScalar(t));

		//console.log(hugo);		
		
		var pr = new THREE.Mesh(projectileGeometry, projectileMaterial);
		pr.velocity = bot.velocity.clone();
		pr.position.x = bot.position.x;
		pr.position.y = bot.position.y;
		pr.position.z = bot.position.z;
		
		var vector = hugo.normalize();		

		var axis = new THREE.Vector3( 0, 1, 0 );
		//var angle = -vrel.x * Math.PI / 180;
		
		//vector.applyAxisAngle( axis, angle );
		
		vector.multiplyScalar(projectile_speed);
				
		pr.velocity.add(vector);
		pr.travelled = 0;
		scene.add(pr);
		projectiles.push(pr);
	}
	scene.add(bot);
	bot.position.z = -100;
	bot.position.x = -5;
	bot.velocity = new THREE.Vector3(-2, 0, 0);
	bots.push(bot);
	
	var radarbot = new THREE.Mesh(botGeometry, new THREE.MeshBasicMaterial({
		color : 0xff0000
	}));
	radarbot.position.copy(bot.position);
	radarbots.push(radarbot);
	radarScene.add(radarbot);
}

function handleKeys() {
	if(KEYS[32]) fire();
	if(KEYS[49]) thrust = -0.4;
	if(KEYS[50]) thrust = -0.3;
	if(KEYS[51]) thrust = -0.2;
	if(KEYS[52]) thrust = -0.1;
	if(KEYS[53]) thrust =  0.0;
	if(KEYS[54]) thrust =  0.1;
	if(KEYS[55]) thrust =  0.2;
	if(KEYS[56]) thrust =  0.3;
	if(KEYS[57]) thrust =  0.4;
	
	if(KEYS[38]) thrust_bottom = 0.1;
}
function fire() {
	
	if(cooldown > 0) return;
	cooldown = 1;
	var projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
	projectile.rotation.x = ship.rotation.x;
	projectile.rotation.y = ship.rotation.y;
	projectile.rotation.z = ship.rotation.z;
	projectile.position.x = ship.position.x;
	projectile.position.y = ship.position.y;
	projectile.position.z = ship.position.z;
	projectile.translateY(-1);
	projectile.travelled = 0;
	projectile.power = 50;
	projectile.velocity = velocity.clone();
	projectile.velocity.add(direction.clone().multiplyScalar(projectile_speed));

	scene.add(projectile);
	projectiles.push(projectile);
	setTimeout(function(){
		cooldown = 0;
	}, 100);
}

function checkProjectileHits() {
	for(var i = 0; i < projectiles.length; i++) {
		if(projectiles[i].position.distanceTo(shield.position) <= shield_radius) {
			
			hitpositions[next_hit*3+0] = projectiles[i].position.x - shield.position.x;
			hitpositions[next_hit*3+1] = projectiles[i].position.y - shield.position.y;
			hitpositions[next_hit*3+2] = projectiles[i].position.z - shield.position.z;
			hittimes[next_hit] = runtime;
			
			if(++next_hit > 127) next_hit = 0;
			
			scene.remove(projectiles[i]);
			projectiles.splice(i, 1);
		}
	}
	shieldMaterial.uniforms.hitposition.needsUpdate = true;
	shieldMaterial.uniforms.hittime.needsUpdate = true;	
}


function checkProjectileHitsParticles() {
	var arr = positions;
	for(var i = 0; i < carrier.numPoints; i++) {
		if(colors[i*4+3] <= 0.0) continue;
		var cp = new THREE.Vector3(arr[i*3+0], arr[i*3+1], arr[i*3+2]);
		for(var j = 0; j < projectiles.length; j++) {
			if(projectiles[j].power <= 0.0) continue;
			var r = projectiles[j].position.distanceTo(cp);
			if(r < hit) {
				var factor = hit-r;
				var damage = factor*factor * 10.0;
				colors[i*4+3] -= damage;
				projectiles[j].power -= damage;
			}
		}
	}
	carrier.geometry.attributes.color.needsUpdate = true;
}
*/