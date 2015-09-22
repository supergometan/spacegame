"use strict";

var Game = function(shaders) {
	
	var boxSize = 1000000;
	
	var renderer;
	
	var scene, pCamera;
	
	var position;
	
	var playerbox;
	
	var ambientLight, lights;
	
	var skyTexture, skyMaterials, skyIndices, skyBox;
		
	var players;
	
	var PID = -1;
	
	var lastTime = new Date().getTime();
			
	var animate = function() {
		var now = new Date().getTime();
		var dt = (now - lastTime)/1000;
		lastTime = now;
		
		var acceleration;
		for(var i = 0; i < players.length; i++) {
			if(players[i] == false) continue;
			acceleration = new THREE.Vector3( 0, 0, -1 );
			acceleration.applyQuaternion( players[i].quaternion );
			
			acceleration.multiplyScalar(players[i].thrust * dt);
			
			players[i].velocity.add(acceleration);
			players[i].position.add(players[i].velocity.clone().multiplyScalar(dt));
			
			players[i].reflectionCamera.position.copy(players[i].position);
			players[i].visible = false;
			players[i].reflectionCamera.updateCubeMap( renderer, scene );
			players[i].visible = true;
			players[i].rotateY(players[i].torque.x * 0.05);
			players[i].rotateX(players[i].torque.y * 0.05);
		}
		
		if(typeof playerbox != "undefined") {
			pCamera.position.copy(playerbox.position);
			pCamera.rotation.copy(playerbox.rotation);
		}
		pCamera.translateZ(20);
		renderer.render(scene, pCamera);
		requestAnimationFrame(animate);		
	}

	this.start = function(pid) {
		
		PID = pid;
		
		renderer = new THREE.WebGLRenderer({
			antialias : false
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 1.0);
		
		document.body.appendChild(renderer.domElement);
		
		players = [];
		
		scene = new THREE.Scene();
		
		pCamera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1.0, boxSize);
		
		skyTexture = THREE.ImageUtils.loadTexture("images/space_skybox.jpg");
		skyTexture.minFilter = skyTexture.magFilter = THREE.LinearFilter;
		skyMaterials = [];
		skyIndices = [3,5,4,2,0,1];
		
		for(var j = 0; j < 6; j++) {
			var i = skyIndices[j];
			skyMaterials[j] = new THREE.ShaderMaterial({
				vertexShader : shaders["sky.vert"],
				fragmentShader : shaders["sky.frag"],
				uniforms : {
					tex : { type : "t", value : skyTexture },
					ti : { type : "f", value : i },
				},
				side : THREE.BackSide
			});
		}
		skyBox = new THREE.Mesh(new THREE.BoxGeometry(boxSize, boxSize, boxSize), new THREE.MeshFaceMaterial(skyMaterials));

		skyBox.rotateX(Math.PI/180 * 90);
		skyBox.rotateZ(Math.PI/180 * 180);

		scene.add(skyBox);
		
		animate();
	}
	
	this.updatePosition = function(pid, position) {
		for(var i = 0; i < players.length; i++) {
			if(players[i].pid = pid) players[i].position.copy(position);
		}
	}
	
	this.addPlayer = function(pid, pos, rot) {
		var reflectionCamera = new THREE.CubeCamera( 0.1, boxSize, 512 );
		var sphere = new THREE.Mesh( new THREE.SphereGeometry( 2, 32, 16 ), new THREE.MeshBasicMaterial( { envMap: reflectionCamera.renderTarget } ));
		sphere.reflectionCamera = reflectionCamera;
		sphere.velocity = new THREE.Vector3(0,0,0);
		sphere.pid = pid;
		sphere.torque = {x:0,y:0};
		sphere.position.copy(pos);
		sphere.rotation.copy(rot);
		sphere.thrust = 0;
		
		console.log("added player");
		
		
		scene.add( sphere.reflectionCamera );
				
		if(PID == pid) playerbox = sphere;
		
		scene.add(sphere);
		players.push(sphere);
	}
	this.removePlayer = function(pid) {
		for(var i = 0; i < players.length; i++) {			
			if(players[i].pid == pid) {
				scene.remove(players[i]);
				players[i] = false;
			}
		}
	}
	
	this.setPlayerPosition = function(p) {
		playerbox.position.copy(p);
	}
	
	this.setPlayerRotation = function(p) {
		playerbox.rotation.copy(p);
	}
	this.updatePlayer = function(pid, name, value) {
		for(var i = 0; i < players.length; i++) {			
			if(players[i].pid == pid) {
				players[i][name] = value;
				console.log(players[i][name]);
			}
		}
	}
}