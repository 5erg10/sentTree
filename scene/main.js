
var camera, scene, renderer, mesh, mouse, controls,
	width = window.innerWidth, 
	height = window.innerHeight;

var clock = new THREE.Clock();

var mouse	= {x : 0, y : 0}
//var mouse = new THREE.Vector2();

var manager = new THREE.LoadingManager();

var arboles, terrain, tonel, hojas, puente, agua, grass, sky, clouds, stars, arostonel, leaves, farol, snowBlend,
	directionalLight, ambientLight, animation, waterNormals, particleCount, emitter, particleGroup, sentiment, song, sentimentArray, helper, searchValue;

var gravityForce = 60;	

var TotalGroup = new THREE.Object3D();

var directionSun = 1;

var directionCam = 1;  

var dayMoment = 'night';

var ambienLightLevel = 0.5;

var nextStation = 0; 
var sunrise = 0;

var updateFcts = [];

var parameters = {
	width: 8,
	height: 2.5,
	widthSegments: 100,
	heightSegments: 100,
	depth: 10,
	param: 4,
	filterparam: 1
};

$( document ).ready(function() {
	startLogoAnim();
	$(document).on("click",function(e) {
		if(e.target.id != 'instructionIcon' && e.target.id != 'instructions' && e.target.id != 'insNode' ){
	       if($('#instructionsButton').position().left == 400){
				$('#instructionsButton').css('left','0px');
				$('#instructions').css('left','-400px');
				$('#instructionIcon').css('transform','rotate(180deg)');
			}
		}
	});
});

function initRender() {

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true, alpha: true } );
	renderer.sortObjects = false;
	renderer.setSize( width, height );
	renderer.setClearColor( 0xffffff, 0 );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setViewport( 0,0,width, height );
	renderer.getMaxAnisotropy();

	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera( 60, (width/height), 0.01, 10000000 );
	//camera.position.set( 0, 1.4, 0 );
	camera.position.set( 0, 0, 1.5 );

	/*controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.70;
	controls.enableZoom = true;*/

	buildShape();

	directionalLight = new THREE.DirectionalLight(0xeeeeee, 1);
	directionalLight.position.set(0, 0, 0);
	directionalLight.castShadow = true;
	directionalLight.shadow.camera.far = 20;
	directionalLight.shadow.darkness = 0.1;
	directionalLight.shadow.mapSize.width = 4096;
	directionalLight.shadow.mapSize.height = 4096;
	directionalLight.name = 'luzDireccional'

	scene.add( directionalLight );

	var bulbGeometry = new THREE.SphereGeometry( 0.015, 4, 4 );
	light = new THREE.PointLight( 0xffdd88, 1, 3, 0 );
	bulbMat = new THREE.MeshStandardMaterial( {
		emissive: 0xffdd88,
		emissiveIntensity: 1,
		color: 0x000000
	});
	light.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
	light.position.set( -0.48, 0.28, 0.48 );
	light.castShadow = false;
	light.intensity = 0;
	light.shadow.camera.near = 0.001;
	light.shadow.camera.far = 5;
	scene.add( light );

	waterNormals = new THREE.TextureLoader().load( 'models/landscape/textures/waternormals.jpg' );
	waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
	water = new THREE.Water( renderer, camera, scene, {
		textureWidth: 1024,
		textureHeight: 1024,
		waterNormals: waterNormals,
		alpha: 	0.5,
		sunDirection: directionalLight.position.clone().normalize(),
		sunColor: 0xeeeeee,
		waterColor: 0x3333FF,
		distortionScale: 1.0,
	} );

	/*helper = new THREE.CameraHelper( directionalLight.shadow.camera );
	scene.add( helper );*/

    ambientLight = new THREE.AmbientLight(0x888888);
    ambientLight.position.set(0,0.6,0);
    scene.add(ambientLight);

	window.addEventListener( 'resize', onWindowResize, false );

	document.addEventListener('mousemove', function(event){
		mouse.x	= (event.clientX / window.innerWidth ) - 0.5;
	}, false)

	$(document).on("keydown", function (e) {
    	if (e.keyCode == '38' ) {
	        convertToSpring();
	    }
	    else if (e.keyCode == '40') {
	    	convertToAutumm();
	    }
	    else if (e.keyCode == '37') {
	        convertToWinter();
	    }
	    else if (e.keyCode == '39') {
	        convertToSummer(); 
	    }
	});
}

function buildShape(){

	manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
	};

	var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				$( "#loadingPercentage" ).html( 'LOADING ' + Math.round(percentComplete, 2) + '%' );
				$('#youtubeVideo').attr('src', 'https://www.youtube.com/embed/3eILoQChD_A?autoplay=1');
				if(percentComplete == 100) {
					setTimeout( function() {
						$( "#loadingProgress" ).removeClass('displayOn');
						$( "#loadingProgress" ).addClass('displayOff');
						$('#wrap').removeClass('displayOff');
						$('#instructionsButton').removeClass('displayOff');
					}, 1000 );
				}
			}
		};
		var onError = function ( xhr ) {
	};

	var skyMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: new THREE.TextureLoader().load('models/landscape/textures/skybox_dif3.jpg')});

	//var cloudMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('models/landscape/textures/cloudsgrass_mask2.png'), transparent: true,  opacity: 0.7, color: 0xFFFFFF, depthWrite: false });
	var cloudMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('models/landscape/textures/dark-clouds.png'), side: THREE.BackSide, transparent: true,  opacity: 1, color: 0xFFFFFF, depthWrite: false  });

	var starsMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('models/landscape/textures/stars.jpg'), side: THREE.BackSide, transparent: true,  opacity: 1, color: 0xFFFFFF, depthWrite: false  });

	var treeMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load('models/landscape/textures/terraText.png'), transparent: true,  opacity: 1, color: 0xFFFFFF });

	var terrainMaterial = new THREE.MeshLambertMaterial({ transparent: true,  opacity: 1, color: 0xFFFFFF });

	var grassMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load('models/landscape/grassTexturePaint.png'), side: THREE.DoubleSide, transparent: true,  opacity: 1, color: 0xFFFFFF });

	var farolMaterial = new THREE.MeshPhongMaterial({ transparent: true,  opacity: 1, color: 0x555555 });

	var leavesMaterial = new THREE.MeshLambertMaterial({ transparent: true,  opacity: 1, color: 0xFFFFFF, side: THREE.DoubleSide });

	var waterMaterial = new THREE.MeshPhongMaterial({ transparent: true,  opacity: 0.2, color: 0x3333FF });

	var generalLambertMaterial = new THREE.MeshLambertMaterial({ transparent: true,  opacity: 1, color: 0xFFFFFF });

	var generalPhongMaterial = new THREE.MeshPhongMaterial({ transparent: true,  opacity: 1, color: 0x777777});

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.setPath( 'models/landscape/' );
				mtlLoader.load( 'landscape4.mtl', function( materials ) {
					materials.preload();
					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.setPath( 'models/landscape/' );
					objLoader.load( 'landscape4.obj', function ( elements ) {

						terrain = elements.children[12];
						terrain.name = "terrain";
						terrain.receiveShadow = true;
						terrain.castShadow = true;
						terrain.material = terrainMaterial;

						piedras = elements.children[11];
						piedras.name = "piedras";
						piedras.castShadow = true;
						piedras.receiveShadow = true;
						//piedras.material = farolMaterial;

						sky = elements.children[10]
						sky.name = "sky";
						sky.material = skyMaterial;
						sky.rotation.y = 0.5;

						var cloudGeometry = new THREE.SphereGeometry( 3, 9, 6 );
						clouds = new THREE.Mesh( cloudGeometry, cloudMaterial )
						//clouds = elements.children[8];
						clouds.name = "clouds";
						//clouds.position.y = 1;
						clouds.material = cloudMaterial;

						var starsGeometry = new THREE.SphereGeometry( 5, 9, 6 );
						stars = new THREE.Mesh( cloudGeometry, cloudMaterial )
						stars.name = "stars";
						stars.material = starsMaterial;
						stars.material.opacity = 0;

						agua = new THREE.Mesh(
							elements.children[8].geometry,
							water.material
						);
						agua.add( water );
						//agua = elements.children[7];
						agua.name = "agua";
						agua.receiveShadow = true;
						//agua.material = water.material;

						arboles = elements.children[7];
						arboles.name = "arboles";
						arboles.castShadow = true;
						arboles.receiveShadow = true;
						//arboles.material = treeMaterial;

						tonel = elements.children[6];
						tonel.name = "tonel";
						tonel.castShadow = true;
						tonel.receiveShadow = true;
						tonel.material = generalLambertMaterial;

						farol = elements.children[5];
						farol.name = "farol";
						farol.castShadow = true;
						farol.receiveShadow = true;
						farol.material = farolMaterial;

						puente = elements.children[4];
						puente.name = "puente";
						puente.castShadow = true;
						puente.receiveShadow = true;
						//puente.material = generalLambertMaterial;

						arostonel = elements.children[3];
						arostonel.name = "arostonel";
						arostonel.castShadow = true;
						arostonel.receiveShadow = true;
						arostonel.material = generalPhongMaterial;

						leaves = elements.children[2];
						leaves.name = "leaves";
						leaves.castShadow = true;
						leaves.receiveShadow = true;
						leaves.material = leavesMaterial;

						grass = elements.children[1];
						grass.geometry = new THREE.Geometry().fromBufferGeometry( grass.geometry );
						grass.name = "grass";
						grass.castShadow = true;
						grass.receiveShadow = true;
						grass.material = grassMaterial;

						snowBlend = elements.children[0];
						snowBlend.name = "snowBlend";
						snowBlend.castShadow = true;
						snowBlend.receiveShadow = true;
						snowBlend.position.y = -0.2;

						TotalGroup.rotation.y = 5;

						sky.renderOrder = 0;
						stars.renderOrder = 1;
						clouds.renderOrder = 2;
						terrain.renderOrder = 3;
						arboles.renderOrder = 4;
						piedras.renderOrder = 5;
						tonel.renderOrder = 6;
						arostonel.renderOrder = 7;
						farol.renderOrder = 8;
						puente.renderOrder = 9;
						grass.renderOrder = 10;
						agua.renderOrder = 11;
						snowBlend.renderOrder = 12;
						leaves.renderOrder = 13;


						TotalGroup.add(terrain);
						TotalGroup.add(arboles);
						TotalGroup.add(piedras);
						TotalGroup.add(puente);
						TotalGroup.add(arostonel);
						TotalGroup.add(tonel);
						TotalGroup.add(farol);
						TotalGroup.add(agua);
						TotalGroup.add(stars);
						TotalGroup.add(clouds);
						TotalGroup.add(sky);
						TotalGroup.add(leaves);
						TotalGroup.add(grass);
						TotalGroup.add(snowBlend);

						scene.add(TotalGroup);
					    
						var cont = 0;

						/*animation = new THREEx.VertexAnimation(grass.geometry, function(origin, rotation, delta, now){
							if( cont%2 == 0 ) {
								var angle	= (now)*(-1) + rotation.y * 100;
								rotation.x	= origin.x + Math.cos(angle)*0.04;
							}
							cont += 1;	
						})

						updateFcts.push(function(delta, now){
							animation.update(delta, now)
						})*/

						console.log(elements);
					}, onProgress, onError );
				});
}

function convertToSpring(){
	scene.remove(scene.getObjectByName( "meteo" ));
	$(".valueIndicator").removeClass('showIndicator').addClass('hideIndicator'); 
	$("#spring").removeClass('hideIndicator').addClass('showIndicator');
	leaves.visible = true;
	leaves.castShadow = true;
	leaves.receiveShadow = true;
	ambienLightLevel = 0.4; 
	movement({ x: 0, y: 0, z: 0 }, grass.position, 0, 7000);
	movement({ r:0.6, g:0.6, b:1 }, sky.material.color, 0, 4000);
	movement({ r:1, g:0.9, b:0.68 }, arboles.material.color, 0, 4000);
	movement({ r:0.32, g:0.5, b:0.15 }, grass.material.color, 0, 4000);
	movement({ r:0.5, g:0.36, b:0.17 }, terrain.material.color, 0, 4000);
	movement({ r:1, g:0.3, b:0.3 }, leaves.material.color, 0, 4000);
	movement({ opacity: 1}, leaves.material, 0, 4000);
	movement({ x: 0, y: -0.2, z: 0 }, snowBlend.position, 0, 20000);
	sunny();
}
function convertToSummer(){
	scene.remove(scene.getObjectByName( "meteo" ));
	$(".valueIndicator").removeClass('showIndicator').addClass('hideIndicator'); 
	$("#summer").removeClass('hideIndicator').addClass('showIndicator');
	leaves.visible = true;
	leaves.castShadow = true;
	leaves.receiveShadow = true; 
	ambienLightLevel = 0.3; 
	movement({ r:1, g:1, b:0.8 }, sky.material.color, 0, 4000);
	movement({ r:1, g:0.6, b:0.4 }, leaves.material.color, 0, 4000);
	movement({ r:1, g:1, b:0.63 }, arboles.material.color, 0, 4000);
	movement({ r:0.4, g:0.5, b:0.3 }, grass.material.color, 0, 4000);
	movement({ r:0.52, g:0.45, b:0.34 }, terrain.material.color, 0, 4000);
	movement({ opacity: 1}, leaves.material, 0, 4000);
	movement({ x: 0, y: -0.005, z: 0 }, grass.position, 0, 3000);
	movement({ x: 0, y: -0.2, z: 0 }, snowBlend.position, 0, 20000);
	sunny();
}
function convertToAutumm(){
	scene.remove(scene.getObjectByName( "meteo" )); 
	$(".valueIndicator").removeClass('showIndicator').addClass('hideIndicator'); 
	$("#auttum").removeClass('hideIndicator').addClass('showIndicator');
	leaves.visible = true;
	leaves.castShadow = true;
	leaves.receiveShadow = true;
	ambienLightLevel = 0.6; 
	movement({ r:0.8, g:0.8, b:1 }, sky.material.color, 0, 4000);
	movement({ r:1, g:1, b:0.76 }, arboles.material.color, 0, 4000);
	movement({ r:0.93, g:0.92, b:0.4 }, grass.material.color, 0, 4000);
	movement({ r:0.5, g:0.38, b:0.22 }, terrain.material.color, 0, 4000);
	movement({ r:0.93, g:0.92, b:0.4 }, leaves.material.color, 0, 4000);
	movement({ opacity: 1}, leaves.material, 0, 4000);
	movement({ x: 0, y: -0.007, z: 0 }, grass.position, 0, 3000);
	movement({ x: 0, y: -0.2, z: 0 }, snowBlend.position, 0, 20000);
	meteoGen('lluvia');	
	cloudy();
}
function convertToWinter(){
	scene.remove(scene.getObjectByName( "meteo" )); 
	$(".valueIndicator").removeClass('showIndicator').addClass('hideIndicator'); 
	$("#winter").removeClass('hideIndicator').addClass('showIndicator');
	leaves.castShadow = false;
	leaves.receiveShadow = false;
	ambienLightLevel = 0.7; 
	movement({ x: 0, y: -0.2, z: 0 }, grass.position, 0, 7000);
	movement({ r:1, g:1, b:1 }, sky.material.color, 0, 4000);
	movement({ r:1, g:0.95, b:0.83 }, arboles.material.color, 0, 4000);
	movement({ r:1, g:1, b:1 }, grass.material.color, 0, 4000);
	movement({ r:0.3, g:0.2, b:0.05 }, terrain.material.color, 0, 4000);
	movement({ r:1, g:1, b:1 }, leaves.material.color, 0, 4000);
	movement({ opacity: 0}, leaves.material, 0, 2000);
	movement({ x: 0, y: 0, z: 0 }, snowBlend.position, 7000, 90000);
	setTimeout(function(){ leaves.visible = false; }, 4000)
	cloudy();
	meteoGen('nieve');
}

function sunny(){
	movement({ opacity: 0}, clouds.material, 0, 4000);
	if(dayMoment == 'day'){
		movement({ intensity: 1}, directionalLight, 0, 2000);
		movement({ intensity: 0}, light, 0, 2000);  
		directionalLight.castShadow = true;
		light.castShadow = false; 			
	}  
}
function cloudy(){
	movement({ opacity: 1}, clouds.material, 0, 4000);movement({ intensity: 0}, light, 0, 2000);
	movement({ intensity: 0}, directionalLight, 0, 2000);
	movement({ intensity: 1}, light, 0, 2000);  
	directionalLight.castShadow = false;
	light.castShadow = true; 
}
function turnToNight(){
	movement({ r:0.2, g:0.2, b:0.9 }, ambientLight.color, 0, 10000); 
	movement({ opacity: 1}, stars.material, 0, 10000);
	movement({ intensity: 0.2}, ambientLight, 0, 4000);
	movement({ intensity: 1}, light, 0, 2000);  
	movement({ intensity: 0}, directionalLight, 0, 2000);
	directionalLight.castShadow = false;
	light.castShadow = true;  
	dayMoment = 'night';
}
function turnToDay(){
	movement({ r:0.8, g:0.8, b:0.8 }, ambientLight.color, 0, 10000); 
	movement({ opacity: 0}, stars.material, 0, 10000);
	movement({ intensity: ambienLightLevel }, ambientLight, 0, 4000);
	if( clouds.material.opacity == 0 ) {
		movement({ intensity: 0}, light, 0, 2000);
		movement({ intensity: 1}, directionalLight, 0, 2000);
		directionalLight.castShadow = true;
		light.castShadow = false; 
	}
	dayMoment = 'day';
}
function meteoGen(value) {
	if(value == 'lluvia'){
		var gravity = -100;
		var texttureType = 'raindrop3flip';
		gravityForce = 1;
		var number = 60000;
	}
	else if ( value == 'nieve') { 
		var gravity = -10;
		var texttureType = 'smokeparticle';
		gravityForce = 60;
		var number = 40000;
	}
	scene.remove(scene.getObjectByName( "nieve" )); 
   	particleGroup = new SPE.Group({
   		texture: {
            value: THREE.ImageUtils.loadTexture('images/'+texttureType+'.png')
        }
   	});
   	emitter = new SPE.Emitter({
        type: 1,
        maxAge: {
            value: 5
        },
        isStatic: false,
        duration: null,
        direction: 1,
        activeMultiplier: 1,
        position: {
            value: new THREE.Vector3(0, 2, 0),
            spread: new THREE.Vector3( 3, 0, 3 ),
            radius: 40
        },
        acceleration: {
            value: new THREE.Vector3(0, gravity, 0),
            spread: new THREE.Vector3( 10, 0, 10 )
        },
        velocity: {
            value: new THREE.Vector3(0, 0, 0),
            spread: new THREE.Vector3(0,0,0),
            randomise: true   
        },
        color: {
            value: [ new THREE.Color('white'), new THREE.Color('red') ]
        },
        size: {
            value: 0.06
        },
        particleCount: number
    });
    particleGroup.addEmitter( emitter );
   	particleGroup.mesh.name = 'meteo';
   	particleGroup.mesh.renderOrder = 14;
   	scene.add( particleGroup.mesh );
}

var lastTimeMsec= null

/*requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		updateFcts.forEach(function(updateFn){
			updateFn(deltaMsec/3000, nowMsec/3000)
		})
})*/

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function movement(value, object, delay, duration){
    var tween = new TWEEN.Tween(object).to(
      	 value
    	,duration).easing(TWEEN.Easing.Quadratic.Out).onUpdate(function () {
          }).delay(delay).start();
}

function animate() {

	requestAnimationFrame( animate );

    TWEEN.update();

	render();

	//if(controls) controls.update( clock.getDelta() );
}
function render(){

	var velocity = 0.00005;

	renderer.render(scene,camera);

	//----------- water animation ---------------

	var time = performance.now() * 0.001;

	water.material.uniforms.time.value -= 1.0 / 50.0;

	water.render();

	//----------- sun animation ---------------

	sunrise += (velocity*10);
	var angle1 = (Math.PI)*sunrise;
    var cos = Math.cos(angle1);
    var sin = Math.sin(angle1);

    if(stars != undefined){
	    if(cos > -0.6) { 
	    	if( dayMoment == 'night' ){ turnToDay(); }
	    }
	    else {
			if( dayMoment == 'day' ){ turnToNight(); }
	    }
    }
    if(directionalLight != undefined){
	    directionalLight.position.y = 1.1*cos;
	    directionalLight.position.x = 1.1*sin;

	    if(directionalLight.position.z >= 8) directionSun = -1;
	    else if(directionalLight.position.z <= -8) directionSun = 1;

	    directionalLight.position.z += (sunrise/10000)*directionSun;
    }

    //--------- camera animation ----------------

	if(controls == undefined){
		camera.position.x += (mouse.x - camera.position.x);
		camera.lookAt( new THREE.Vector3( 0, 0.4, 0 ) );
	}
	
	//----------- objects animation -----------stars

	if(clouds) clouds.rotation.y += (velocity*30);
	if(stars) stars.rotation.y += (velocity*10);

	if(animation) animation.update();

	//-------snor animation -------------------

	var delta = clock.getDelta();
	if(particleGroup!=undefined) { particleGroup.tick( delta/gravityForce ); }

	if(helper != undefined) {
		helper.update(); // required
	}

}

$('#searchForm').submit(function(event) {
		event.preventDefault();
		$( "#loadingPercentage" ).html('Searching your suitable song...');
		$( "#loadingProgress" ).removeClass('displayOff');
		$( "#loadingProgress" ).addClass('displayOn');
		$('#songLetter').removeClass('showIndicator');
		$('#songLetter').addClass('hideIndicator');
		$('#infoLetter').removeClass('showIndicator');
		$('#infoLetter').addClass('hideIndicator');
		sentiment = 0;
        console.log($('#search').val());
        searchValue = $('#search').val();
        findSong(searchValue);
        return false;
});

$('#instructionsButton').on('click', function(){
	if($('#instructionsButton').position().left == 0){
		$('#instructionsButton').css('left','400px');
		$('#instructions').css('left','0px');
		$('#instructionIcon').css('transform','rotate(0deg)');
	}
	else{
		$('#instructionsButton').css('left','0px');
		$('#instructions').css('left','-400px');
		$('#instructionIcon').css('transform','rotate(180deg)');
	}
})

function findSong(user){
	$.get('https://4ugcniyxp8.execute-api.eu-west-1.amazonaws.com/prod/lients-song?user='+user,function(data){
		console.log('data.songs: ', data);
		if(data.songs.length > 0) PlaySentiment(user, data.songs[0]);
		else findSong(user);
	});
}

function PlaySentiment(user, music){
	console.log('play function: ', user, music);
	$.getJSON('https://4ugcniyxp8.execute-api.eu-west-1.amazonaws.com/prod/lients-sentiment?user='+user,function(dataSent){
		sentiment = dataSent.sentiment;
		if(sentiment <= 0.25){ convertToWinter(); song = "Maldito - Alone Made Of Ice";/*song = "You Don't Have To Cry Rene & Angela";*/}
		else if(sentiment > 0.25 && sentiment <= 0.5) { convertToAutumm(); song = music; }
		else if(sentiment > 0.5 && sentiment <= 0.75) { convertToSpring(); song = music; }
		else if(sentiment > 0.75) { convertToSummer(); song = music; }
		searchYoutube(song);
		console.log(sentiment);
		setTimeout(function(){ $('#search').val(''); }, 500)
	})	
}

function searchYoutube(songi) {
	console.log('song: ', songi)	
	var request = gapi.client.youtube.search.list({
	  q: songi,
	  type: 'video',
	  part: 'snippet'
	});
	var insertSongToWeb = songi.replace("/", " - ");
	console.log('word song: ', insertSongToWeb);
	request.execute(function(response) {
		$( "#loadingProgress" ).removeClass('displayOn');
		$( "#loadingProgress" ).addClass('displayOff');
	    var str = JSON.stringify(response.result);
	    str = jQuery.parseJSON(str);
	    console.log('str: ', str.items[0].id.videoId);
	    $('#infoLetter').html(searchValue+' tweets sentiment');
	    $('#youtubeVideo').attr('src', 'https://www.youtube.com/embed/'+str.items[0].id.videoId+'?autoplay=1');
		$('#songLetter').html(' <i class="fa fa-music" aria-hidden="true"></i>  '+insertSongToWeb);
		$('#songLetter').removeClass('hideIndicator');
		$('#songLetter').addClass('showIndicator');
		$('#infoLetter').removeClass('hideIndicator');
		$('#infoLetter').addClass('showIndicator');
	});
}

function init() {
	gapi.client.setApiKey("AIzaSyCKzdy9FfPgDWrpCgwBxyJX_G0csHhu_Uw");
	gapi.client.load("youtube", "v3", function() {
    	console.log('youtube API is ready!!');
		//searchYoutube();
	});
}
