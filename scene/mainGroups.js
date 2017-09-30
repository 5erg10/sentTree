
var camera, scene, renderer, mesh, mouse, controls,
	width = window.innerWidth, 
	height = window.innerHeight;

var clock = new THREE.Clock();
var mouse = new THREE.Vector2();

var manager = new THREE.LoadingManager();

var arboles, terrain, tonel, hojas, puente, agua, grass, grass2, sky, clouds, arostonel;

/*var arboles = new THREE.Object3D();
    arboles.name = 'arboles';

var terrain = new THREE.Object3D();
    terrain.name = 'terrain';

var tonel = new THREE.Object3D();
    tonel.name = 'tonel';    

var hojas = new THREE.Object3D();
    hojas.name = 'hojas';

var puente = new THREE.Object3D();
    puente.name = 'puente';

var agua = new THREE.Object3D();
    agua.name = 'agua';

var grass = new THREE.Object3D();
    grass.name = 'grass';

var grass2 = new THREE.Object3D();
    grass2.name = 'grass2'; 

var sky = new THREE.Object3D();
    sky.name = 'sky';

var clouds = new THREE.Object3D();
    clouds.name = 'clouds';               

var arostonel = new THREE.Object3D();
    arostonel.name = 'arostonel';*/

var material = new THREE.MeshLambertMaterial({color: 0x666666});    

var nextStation = 0;    
	
init();
animate();

function init() {

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true, alpha: true } );
	renderer.setSize( width, height );
	renderer.setClearColor( 0xffffff, 0 ); // the default
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setViewport( 0,0,width, height );
	renderer.getMaxAnisotropy();

	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera( 40, (width/height), 0.01, 10000000 );
	camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	//camera.position.set( 1500, 1500, 1500 );
	//camera.up = new THREE.Vector3(0,0,1);
	//camera.target.set(0,0.1,0);
	camera.position.set( 0, 0.06, 1.1 );

	mouse = new THREE.Vector2();

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.70;
	controls.enableZoom = true;
	//controls.target.set( 0,0.5,0 );

	buildShape();

	//console.log('arbol fuera: ', arboles.children[0].material.color);

	var directionalLight = new THREE.DirectionalLight(0xeeeeee, 1.5);
		directionalLight.position.set(0, 3, 10);
		directionalLight.target.position.set( 0, 0, 0 );
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.far = 20;
		directionalLight.shadow.darkness = 0.1;
		directionalLight.shadow.mapSize.width = 4096;
		directionalLight.shadow.mapSize.height = 4096;
		directionalLight.name = 'luzDireccional'

	scene.add( directionalLight );

	//var helper = new THREE.CameraHelper( directionalLight.shadow.camera );
	//scene.add( helper );

    var ambientLight = new THREE.AmbientLight(0x998866);
    ambientLight.position.set(0,0.6,0);
    scene.add(ambientLight);

	window.addEventListener( 'resize', onWindowResize, false );

	/*setInterval(function(){ 

		if( nextStation == 0) {
			movement({ r:0.2, g:0.12, b:0 }, arboles.children[0].material.color, 0, 4000);
			movement({ r:1, g:1, b:1 }, grass.children[0].material.color, 0, 4000);
			movement({ r:1, g:1, b:1 }, grass2.children[0].material.color, 0, 4000);
			//movement({ r:1, g:1, b:1 }, terrain.children[0].material.color, 0, 4000);
			//movement({ x: 1, y: 0.05, z: 1 }, hojas.scale, 0, 800);
			//movement({ intensity: 1 }, ambientLight, 0, 4000);
			//movement({ r:1, g:0, b:0 }, ambientLight.color, 0, 4000);
			//ambientLight.intensity = 0.5;
			//ambientLight.color.setHex( 0xffffff );
			$('body').removeClass('autum');
			nextStation = 1;

		}
		else if (nextStation == 1) { 
			//movement({ x: 1, y: 1, z: 1 }, hojas.scale, 0, 800);
			movement({ r:0.9, g:0.78, b:0.3 }, arboles.children[0].material.color, 0, 4000);
			movement({ r:0.3, g:0.76, b:0.6 }, grass.children[0].material.color, 0, 4000);
			movement({ r:0.3, g:0.76, b:0.6 }, grass2.children[0].material.color, 0, 4000);
			//movement({ r:1, g:1, b:1 }, terrain.children[0].material.color, 0, 4000);
			//ambientLight.intensity = 0.8;
			//ambientLight.color.setHex( 0x00ff00 );
			$('body').addClass('spring');
			nextStation = 2;
		}
		else if (nextStation == 2) { 
			movement({ r:0.8, g:0.8, b:0.5 }, arboles.children[0].material.color, 0, 4000);
			movement({ r:1, g:1, b:0.2 }, grass.children[0].material.color, 0, 4000);
			movement({ r:1, g:1, b:0.2 }, grass2.children[0].material.color, 0, 4000);
			//movement({ r:1, g:1, b:1 }, terrain.children[0].material.color, 0, 4000);
			//ambientLight.intensity = 0.5;
			//ambientLight.color.setHex( 0xffff00 );
			$('body').removeClass('spring');
			$('body').addClass('autum');
			nextStation = 0;
		}
	 }, 7000);*/

}

function buildShape(){

	manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
	};

	var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log('percentComplete:', percentComplete);
				console.log( Math.round(percentComplete, 2) + '%' );
				$( "#loadingPercentage" ).html( 'LOADING ' + Math.round(percentComplete, 2) + '%' );
				if(percentComplete == 100) {
					setTimeout( function() {
						$( "#loadingProgress" ).css('display', 'none');
						$('body').addClass('whiteBack');
					}, 15000 );
				}
			}
		};
		var onError = function ( xhr ) {
	};
	var skytexture = new THREE.TextureLoader().load('models/landscape/textures/skybox_dif2.jpg');
	var skyT = new THREE.MeshBasicMaterial({color: 0xffffff, map: skytexture});

	var Cloudtexture = new THREE.TextureLoader().load('models/landscape/textures/cloudsgrass_mask.png');
	var cloudT = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('models/landscape/textures/cloudsgrass_mask2.png'), transparent: true,  opacity: 0.7, color: 0xFFFFFF });
	//var cloudT = new THREE.MeshBasicMaterial({color: 0xffffff, map: Cloudtexture});

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.setPath( 'models/landscape/' );
				mtlLoader.load( 'landscape.mtl', function( materials ) {
					materials.preload();
					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.setPath( 'models/landscape/' );
					objLoader.load( 'landscape.obj', function ( elements ) {
						/*sky.add( elements.children[11] );
						clouds.add( elements.children[10] );
						terrain.add( elements.children[9] );
						arboles.add( elements.children[8] );
						tonel.add( elements.children[6] );
						puente.add( elements.children[4] );
						arostonel.add( elements.children[3] );
						agua.add( elements.children[2] );
						grass.add( elements.children[1] );
						grass2.add( elements.children[0] );
						
						terrain.children[0].receiveShadow = true;
						terrain.children[0].castShadow = true;
						agua.children[0].receiveShadow = true;
						arboles.children[0].castShadow = true;
						arboles.children[0].receiveShadow = true;
						tonel.children[0].castShadow = true;
						tonel.children[0].receiveShadow = true;
						puente.children[0].castShadow = true;
						puente.children[0].receiveShadow = true;
						grass.children[0].castShadow = true;
						grass.children[0].receiveShadow = true;
						grass2.children[0].castShadow = true;
						grass2.children[0].receiveShadow = true;
						arostonel.children[0].castShadow = true;
						arostonel.children[0].receiveShadow = true;

						sky.children[0].material = skyT;
						clouds.children[0].material = cloudT;

						//scene.add( elements );
						scene.add(arboles);
						scene.add(terrain);
						scene.add(puente);
						scene.add(agua);
						scene.add(grass);
						scene.add(grass2);
						scene.add(sky);
						scene.add(clouds);
						scene.add(arostonel);
						scene.add(tonel);*/

						var arboles = elements.children[8];
						arboles.name = "arboles";

						scene.add(arboles);

						/*scene.add( elements.children[11] );
						scene.add( elements.children[10] );
						scene.add( elements.children[9] );
						scene.add( elements.children[8] );
						scene.add( elements.children[6] );
						scene.add( elements.children[4] );
						scene.add( elements.children[3] );
						scene.add( elements.children[2] );
						scene.add( elements.children[1] );
						scene.add( elements.children[0] );	*/

						console.log(elements);
					}, onProgress, onError );
				});
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

	/*setTimeout( function() {
		requestAnimationFrame( animate );
	}, 1000/30 );*/

	requestAnimationFrame( animate );

    TWEEN.update();

	render();

	//if(controls) controls.update( clock.getDelta() );
}
function render(){
	renderer.render(scene,camera);

	var velocity = 0.001;

	arboles.rotation.y -= velocity
	terrain.rotation.y -= velocity;
	hojas.rotation.y -= velocity;
	tonel.rotation.y -= velocity;
	arostonel.rotation.y -= velocity;
	puente.rotation.y -= velocity;
	agua.rotation.y -= velocity;
	grass.rotation.y -= velocity;
	grass2.rotation.y -= velocity;
	clouds.rotation.y += velocity;
}
