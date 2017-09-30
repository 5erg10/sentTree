
var camera, scene, renderer, mesh, mouse, controls,
	width = window.innerWidth, 
	height = window.innerHeight;

var light;
var lightShadowMapViewer;	

var clock = new THREE.Clock();
var mouse = new THREE.Vector2();

var manager = new THREE.LoadingManager();

var arboles = new THREE.Object3D();
    arboles.name = 'arboles';

var terrain = new THREE.Object3D();
    terrain.name = 'terrain';

var nextStation = 0;

var showHUD = false;

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;
var HUD_MARGIN = 0.05;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var FLOOR = - 250;    
	
init();
animate();

function init() {

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true, alpha: true } );
	renderer.setClearColor( 0xffffff, 0 ); // the default
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.setViewport( 0,0,width, height );
	renderer.getMaxAnisotropy();

	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera( 50, (width/height), 0.1, 10000000 );
	//camera.position.set( 1500, 1500, 1500 );
	camera.position.set( 5, 0, 0 );

	mouse = new THREE.Vector2();

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.70;
	controls.enableZoom = true;
	controls.target.set( 0,0,0 );


	/*var directionalLight = new THREE.DirectionalLight(0xeeeeee, 1.5);
		directionalLight.position.set(2000, 3500,2500);
		directionalLight.target.position.set( 0, 0, 0 );
		directionalLight.shadowCameraVisible = true;
		directionalLight.castShadow = true;
		directionalLight.shadowCameraFar = 10000;
		directionalLight.shadow.bias = 0.01;
		directionalLight.shadowDarkness = 0.2;
		directionalLight.shadowMapWidth = 2048;
		directionalLight.shadowMapHeight = 2048;
		directionalLight.name = 'luzDireccional'

	scene.add( directionalLight );*/

	light = new THREE.DirectionalLight(0xeeeeee, 1.5);
		light.position.set( 2000, 3500,2500 );
		light.target.position.set( 0, 0, 0 );
		light.shadowCameraVisible = true;
		light.castShadow = true;
		light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, (width/height), 0.1, 10000000 ) );
		light.shadow.bias = 0.01;
		light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
		light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
	scene.add( light );

	buildShape();

	scene.add(arboles);
	scene.add(terrain);

    /*var ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);*/

	//
	window.addEventListener( 'resize', onWindowResize, false );

	setInterval(function(){ 

		if( nextStation == 0) {
			movement({ r:1, g:1, b:1 }, arboles.children[0].material.color, 0, 4000);
			movement({ r:1, g:1, b:1 }, terrain.children[0].material.color, 0, 4000);
			$('body').removeClass('autum');
			nextStation = 1;

		}
		else if (nextStation == 1) { 
			movement({ r:0.6, g:0.3, b:0 }, arboles.children[0].material.color, 0, 4000);
			movement({ r:0, g:0.5, b:0 }, terrain.children[0].material.color, 0, 4000);
			$('body').addClass('spring');
			nextStation = 2;
		}
		else if (nextStation == 2) { 
			movement({ r:0.9, g:0.8, b:0.3 }, arboles.children[0].material.color, 0, 4000);
			movement({ r:1, g:1, b:0.2 }, terrain.children[0].material.color, 0, 4000);
			$('body').removeClass('spring');
			$('body').addClass('autum');
			nextStation = 0;
		}
	 }, 7000);

}

function buildShape(){

	manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
	};

	var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};
		var onError = function ( xhr ) {
	};

	new THREE.OBJLoader( manager ).load( 'models/tree4/tree4.obj', function ( elements ) {
			console.log(elements);
			terrain.add( elements.children[0] );
			arboles.add( elements.children[0] );
			//terrain.scale.set(0.05,0.05,0.05);
			//arboles.scale.set(0.05,0.05,0.05);
			terrain.children[0].receiveShadow = true;
			arboles.children[0].castShadow = true;
		}, onProgress, onError );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function movement(value, object, delay, duration){
    var tween = new TWEEN.Tween(object).to(
      	 value
    	,duration).easing(TWEEN.Easing.Quadratic.Out).onUpdate(function () {
          	/*camera.position.x = valueX;
          	camera.position.y = valueY;
          	camera.position.z = valueZ;*/
          }).delay(delay).start();
}

function animate() {

	setTimeout( function() {
		requestAnimationFrame( animate );
	}, 1000/30 );

    TWEEN.update();

	render();

	//if(controls) controls.update( clock.getDelta() );
}
function render(){
	renderer.render(scene,camera);

	arboles.rotation.y -= 0.0001;
	terrain.rotation.y -= 0.0001;
}
