var Gallery = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000),
  renderer: new THREE.WebGLRenderer({ antialias: true }),
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector3(),
  textureLoader: new THREE.TextureLoader(),
  raycastSetUp: function () {
    Gallery.mouse.x = 0; //(0.5) * 2 - 1; si se quiere que tenga mas azucar
    Gallery.mouse.y = 0; //(0.5) * 2 + 1;
    Gallery.mouse.z = 0.0001;
  },
  boot: function () {
    //tiempo delta del render
    Gallery.prevTime = performance.now();

    Gallery.initialRender = true;


    Gallery.scene.fog = new THREE.FogExp2(0x666666, 0.025);

    Gallery.renderer.setSize(window.innerWidth, window.innerHeight);
    Gallery.renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(Gallery.renderer.domElement);

    Gallery.userBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    Gallery.userBoxMat = new THREE.MeshBasicMaterial({ color: 0xE06666, wireframe: true });
    Gallery.user = new THREE.Mesh(Gallery.userBoxGeo, Gallery.userBoxMat);

    var texture = Gallery.textureLoader.load('./asset/loader.png');
    texture.minFilter = THREE.LinearFilter;
    Gallery.textureAnimation = new TextureAnimator(texture, 5, 6, 30, 60);
    var img = new THREE.MeshBasicMaterial({ map: texture, transparent: false });


    var mS = (new THREE.Matrix4()).identity();
    mS.elements[0] = -1;
    mS.elements[10] = -1;

    //el user es invisible ya que solo sirve para determinar cordenadas
    Gallery.user.visible = false;

    //Haca hacemos el  Bounding Box y el HelperBox
    //boundingbox es usado para colisiones, Helper box es para debug
    Gallery.user.BBox = new THREE.Box3();

    //hacemos que la colision sea hijo de la camara
    Gallery.camera.add(Gallery.user);
    Gallery.controls = new THREE.PointerLockControls(Gallery.camera, document.canvas);
    Gallery.scene.add(Gallery.controls.getObject());

    Gallery.pastX = Gallery.controls.getObject().position.x;
    Gallery.pastZ = Gallery.controls.getObject().position.z;

    Gallery.canvas = document.querySelector('canvas');
    Gallery.canvas.className = "gallery";

    //clickear estos elementos inicia la escena
    Gallery.bgMenu = document.getElementById('background_menu');
    Gallery.play = document.getElementById('play_button');

    //habilitar o deshabilitar en base a el puntero
    Gallery.menu = document.getElementById("menu");

    Gallery.moveVelocity = new THREE.Vector3();
    Gallery.jump = false;
    Gallery.moveForward = false;
    Gallery.moveBackward = false;
    Gallery.moveLeft = false;
    Gallery.moveRight = false;

    window.addEventListener('resize', function () {
      Gallery.renderer.setSize(window.innerWidth, window.innerHeight);
      Gallery.camera.aspect = window.innerWidth / window.innerHeight;
      Gallery.camera.updateProjectionMatrix();
    });

  },

  pointerControls: function () {
    if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {
      Gallery.canvas.requestPointerLock = Gallery.canvas.requestPointerLock || Gallery.canvas.mozRequestPointerLock || Gallery.canvas.webkitRequestPointerLock;
      Gallery.canvas.exitPointerLock = Gallery.canvas.exitPointerLock || Gallery.canvas.mozExitPointerLock || Gallery.canvas.webkitExitPointerLock;

      document.addEventListener("keydown", function (e) {
        if (e.keyCode === 102 || e.keyCode === 70) {
          Gallery.toggleFullscreen();
          Gallery.canvas.requestPointerLock();
        }
      });

      document.addEventListener('click', function () {
        if (Gallery.controls.enabled === true) {
          Gallery.raycaster.setFromCamera(Gallery.mouse.clone(), Gallery.camera);
          //calcular los objetos del rayo de interseccion
          Gallery.intersects = Gallery.raycaster.intersectObjects(Gallery.paintings);
          if (Gallery.intersects.length !== 0) {
          }
        } else {

          Gallery.prevTime = performance.now();
        }
      });

      Gallery.bgMenu.addEventListener("click", function () {
        Gallery.canvas.requestPointerLock();

      });
      Gallery.play.addEventListener("click", function () {
        Gallery.canvas.requestPointerLock();
      });

      //chequeador de estado de puntero
      document.addEventListener('pointerlockchange', Gallery.changeCallback, false);
      document.addEventListener('mozpointerlockchange', Gallery.changeCallback, false);
      document.addEventListener('webkitpointerlockchange', Gallery.changeCallback, false);

      document.addEventListener('pointerlockerror', Gallery.errorCallback, false);
      document.addEventListener('mozpointerlockerror', Gallery.errorCallback, false);
      document.addEventListener('webkitpointerlockerror', Gallery.errorCallback, false);
    } else {
    }
  },

  changeCallback: function (event) {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      if (document.pointerLockElement === Gallery.canvas || document.mozPointerLockElement === Gallery.canvas || document.webkitPointerLockElement === Gallery.canvas) {
        Gallery.controls.enabled = true;
        Gallery.menu.className += "hide";
        Gallery.bgMenu.className += "hide";
        document.addEventListener("touchstart", Gallery.moveCallback, true);
        document.addEventListener("touchend", Gallery.moveCallback, true);
        document.addEventListener("touchleave", Gallery.moveCallback, true);
        document.addEventListener("touchmove", Gallery.moveCallback, true);
      } else {
        Gallery.controls.enabled = false;
        Gallery.menu.className = Gallery.menu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
        Gallery.bgMenu.className = Gallery.bgMenu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
        document.removeEventListener("touchmove", Gallery.moveCallback, false);
      }
    } else {
      if (document.pointerLockElement === Gallery.canvas || document.mozPointerLockElement === Gallery.canvas || document.webkitPointerLockElement === Gallery.canvas) {
        Gallery.controls.enabled = true;
        Gallery.menu.className += "hide";
        Gallery.bgMenu.className += "hide";
        document.addEventListener("mousemove", Gallery.moveCallback, false);
      } else {
        Gallery.controls.enabled = false;
        Gallery.menu.className = Gallery.menu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
        Gallery.bgMenu.className = Gallery.bgMenu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
        document.removeEventListener("mousemove", Gallery.moveCallback, false);
      }
    }
  },
  errorCallback: function (event) {
    console.error("Pointer Lock Failed");
  },
  moveCallback: function (event) {
    if (event = event.touches !== undefined) {
    } else {
    }
    // implementacion de touch quizas para mas tarde
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  },
  toggleFullscreen: function () {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  },
  movement: function () {
    document.addEventListener("keydown", function (e) {
      if (e.keyCode === 87 || e.keyCode === 38) { //w or UP
        Gallery.moveForward = true;
      }
      else if (e.keyCode === 65 || e.keyCode === 37) { //A or LEFT
        Gallery.moveLeft = true;
      }
      else if (e.keyCode === 83 || e.keyCode === 40) { //S or DOWN 
        Gallery.moveBackward = true;
      }
      else if (e.keyCode === 68 || e.keyCode === 39) { //D or RIGHT
        Gallery.moveRight = true;

      }
    });

    document.addEventListener("keyup", function (e) {
      if (e.keyCode === 87 || e.keyCode === 38) { //w or UP
        Gallery.moveForward = false;
      }
      else if (e.keyCode === 65 || e.keyCode === 37) { //A or LEFT
        Gallery.moveLeft = false;
      }
      else if (e.keyCode === 83 || e.keyCode === 40) { //S or DOWN 
        Gallery.moveBackward = false;
      }
      else if (e.keyCode === 68 || e.keyCode === 39) { //D or RIGHT
        Gallery.moveRight = false;
      }
    });

  },

  create: function () {
    //Se hizo la luz!
    Gallery.worldLight = new THREE.AmbientLight(0xffffff);
    Gallery.scene.add(Gallery.worldLight);

    Gallery.textureLoader.load('./asset/floor.jpg', function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 1);

      Gallery.floorMaterial = new THREE.MeshPhongMaterial({ map: texture });
      Gallery.floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), Gallery.floorMaterial);

      Gallery.floor.rotation.x = Math.PI / 2;
      Gallery.floor.rotation.y = Math.PI;
      Gallery.scene.add(Gallery.floor);
    }, undefined, function (err) { console.error(err) });

    //Crear las paredes ////
    Gallery.wallGroup = new THREE.Group();
    Gallery.scene.add(Gallery.wallGroup);

    Gallery.textureLoader.load('./asset/wall.jpg',
      function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 1);

        Gallery.wallMaterial = new THREE.MeshLambertMaterial({ map: texture });

        Gallery.wall1 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), Gallery.wallMaterial);
        Gallery.wall2 = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 0.001), Gallery.wallMaterial);
        Gallery.wall3 = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 0.001), Gallery.wallMaterial);
        Gallery.wall4 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), Gallery.wallMaterial);

        Gallery.wallGroup.add(Gallery.wall1, Gallery.wall2, Gallery.wall3, Gallery.wall4);
        Gallery.wallGroup.position.y = 3;

        Gallery.wall1.position.z = -3;
        Gallery.wall2.position.x = -20;
        Gallery.wall2.rotation.y = Math.PI / 2;
        Gallery.wall3.position.x = 20;
        Gallery.wall3.rotation.y = -Math.PI / 2;
        Gallery.wall4.position.z = 3;
        Gallery.wall4.rotation.y = Math.PI;

        for (var i = 0; i < Gallery.wallGroup.children.length; i++) {
          Gallery.wallGroup.children[i].BBox = new THREE.Box3();
          Gallery.wallGroup.children[i].BBox.setFromObject(Gallery.wallGroup.children[i]);
        }
      },
      undefined,
      function (err) { console.error(err); }
    );

    Gallery.textureLoader.load('./asset/ceil.jpg',
      function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(12, 2);

        Gallery.ceilMaterial = new THREE.MeshLambertMaterial({ map: texture });

        Gallery.ceil = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), Gallery.ceilMaterial);
        Gallery.ceil.position.y = 6;
        Gallery.ceil.rotation.x = Math.PI / 2;

        Gallery.scene.add(Gallery.ceil);
      },
      undefined,
      function (err) { console.error(err); }
    );


    Gallery.artGroup = new THREE.Group();

    Gallery.num_of_paintings = 34;
    Gallery.paintings = [];
    for (var i = 0; i < Gallery.num_of_paintings; i++) {
      (function (index) {
        var artwork = new Image();
        var ratiow = 0;
        var ratioh = 0;

        var source = './images/' + (index).toString() + '.jpg';
        artwork.src = source;

        var texture = Gallery.textureLoader.load(artwork.src);
        texture.minFilter = THREE.LinearFilter;
        var img = new THREE.MeshBasicMaterial({ map: texture });

        artwork.onload = function () {
          ratiow = artwork.width / 350;
          ratioh = artwork.height / 350;
          // plano para el espacio en esta seccion podemos ubicar las imagenes etc
          var plane = new THREE.Mesh(new THREE.BoxGeometry(ratiow, ratioh, 0.09), img); //alto, ancho
          plane.overdraw = true;
          if (index <= Math.floor(Gallery.num_of_paintings / 2) - 1) //media  mitad
          {
            plane.position.set(5 * index - 17.5, 2.50, -2.96); //y e z se mantienen constantes
          } else {
            plane.position.set(2. * index - 55, 2.50, 2.96);
            plane.rotation.y = Math.PI;
          }

          plane.userData = {
            test: true,
          };


          
          Gallery.scene.add(plane);
          Gallery.paintings.push(plane);
        }
      }(i))
    }
  },
  render: function () {
    requestAnimationFrame(Gallery.render);

    if (Gallery.controls.enabled === true) {
      Gallery.initialRender = false;
      var currentTime = performance.now();
      var delta = (currentTime - Gallery.prevTime) / 1000;


      Gallery.moveVelocity.x -= Gallery.moveVelocity.x * 10.0 * delta;
      Gallery.moveVelocity.y -= 9.8 * 7.0 * delta;
      Gallery.moveVelocity.z -= Gallery.moveVelocity.z * 10.0 * delta;

      Gallery.textureAnimation.update(1000 * delta);

      // velocidad aplicada a las teclas
      if (Gallery.moveForward) {
        Gallery.moveVelocity.z -= 38.0 * delta;
      }
      if (Gallery.moveBackward) {
        Gallery.moveVelocity.z += 38.0 * delta;
      }
      if (Gallery.moveLeft) {
        Gallery.moveVelocity.x -= 38.0 * delta;
      }
      if (Gallery.moveRight) {
        Gallery.moveVelocity.x += 38.0 * delta;
      }

      Gallery.controls.getObject().translateX(Gallery.moveVelocity.x * delta);
      Gallery.controls.getObject().translateY(Gallery.moveVelocity.y * delta);
      Gallery.controls.getObject().translateZ(Gallery.moveVelocity.z * delta);

      if (Gallery.controls.getObject().position.y < 1.75) {
        Gallery.jump = false;
        Gallery.moveVelocity.y = 0;
        Gallery.controls.getObject().position.y = 1.75;
      }

      if (Gallery.controls.getObject().position.z < -2) {
        Gallery.controls.getObject().position.z = -2;
      }
      if (Gallery.controls.getObject().position.z > 2) {
        Gallery.controls.getObject().position.z = 2;
      }
      if (Gallery.controls.getObject().position.x < -18) {
        Gallery.controls.getObject().position.x = -18;
      }
      if (Gallery.controls.getObject().position.x > 18) {
        Gallery.controls.getObject().position.x = 18;
      }

      Gallery.raycaster.setFromCamera(Gallery.mouse.clone(), Gallery.camera);
      //calculate objects interesting ray
      Gallery.intersects = Gallery.raycaster.intersectObjects(Gallery.paintings);

      if (Gallery.lastIntersectObj !== undefined)
        Gallery.lastIntersectObj.material.color.set(0xffffff);

      if (Gallery.intersects.length !== 0) {
        Gallery.lastIntersectObj = Gallery.intersects[0].object;
        Gallery.intersects[0].object.material.color.set(0xffffff);
      }

      for (var i = 0; i < Gallery.wallGroup.children.length; i++) {
        if (Gallery.user.BBox.intersectsBox(Gallery.wallGroup.children[i].BBox)) {
          Gallery.user.BBox.setFromObject(Gallery.user);
          
        } else {
          Gallery.wallGroup.children[i].material.color.set(0xffffff);
        }
      }

      Gallery.pastX = Gallery.controls.getObject().position.x;
      Gallery.pastZ = Gallery.controls.getObject().position.z;

       Gallery.user.BBox.setFromObject(Gallery.user);
      
      Gallery.prevTime = currentTime;

      Gallery.renderer.render(Gallery.scene, Gallery.camera);
    } else {
      //reset delta time, so when unpausing, time elapsed during pause
      //doesn't affect any variables dependent on time.
      Gallery.prevTime = performance.now();
    }

    if (Gallery.initialRender === true) {
      for (var i = 0; i < Gallery.wallGroup.children.length; i++) {
       Gallery.wallGroup.children[i].BBox.setFromObject(Gallery.wallGroup.children[i]);
      }
      Gallery.renderer.render(Gallery.scene, Gallery.camera);
    }
  }
};

Gallery.raycastSetUp();
Gallery.boot();
Gallery.pointerControls();
Gallery.movement();
Gallery.create();
Gallery.render();




function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {

  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;

  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

  // durante cuanto debe ser mostrada cada imagen
  this.tileDisplayDuration = tileDispDuration;

  // hace cuuanto se ha visto la imagen
  this.currentDisplayTime = 0;

  // que imagen se esta mostrando esto nos servira para el redirect
  this.currentTile = 0;

  this.update = function (milliSec) {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
      texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}
