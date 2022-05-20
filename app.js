import * as THREE from './build/three.module.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Character from './character.js';

let camera, scene, renderer, object;
let controls;
let mixer;

const displayDiv = document.createElement('div');;
displayDiv.classList.add('displayDiv');
document.body.appendChild(displayDiv);


function init() {

  const container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
  // camera.rotation.y = 1 / 180 * Math.PI;
  camera.position.x = 0;
  camera.position.y = 300;
  camera.position.z = 500;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa2eeff);

  const lightp = new THREE.PointLight(0xffffff, 1, 3000);
  lightp.position.set(0, 1000, 1000);
  scene.add(lightp);
  
  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  controls = new OrbitControls(camera, renderer.domElement);
  
  controls.target.set(0, 100, 0);
  controls.update();

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const geometry = new THREE.BoxGeometry( 1000, 1, 1000 );
  const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  const character = new Character();
  character.onload = function() {
    scene.add(character.FBX.standing);
    renderList.push(character.update);
  }

  render();
}






export let renderList = [];
function render() {
  requestAnimationFrame( render );

  for (let i = 0; i < renderList.length; i++) {
    renderList[i]();
  }

  renderer.render(scene, camera);
}

init();