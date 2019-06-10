import * as THREE from 'three';
import { CAMERA_POSITION, CAMERA_LOOK_AT, theme } from './config';
import Buffer from './Buffer';

var container;
var camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, light: THREE.DirectionalLight;
var buffer = new Buffer();

var init = function () {
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(CAMERA_POSITION[0], CAMERA_POSITION[1], CAMERA_POSITION[2]);
    camera.lookAt(CAMERA_LOOK_AT[0], CAMERA_LOOK_AT[1], CAMERA_LOOK_AT[2]);

    scene = new THREE.Scene();

    scene.background = new THREE.Color(theme.background);

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(0, 100, 0);
    light.lookAt(0, 0, 0);
    light.castShadow = true;
    light.shadow.camera.left = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.top = 10;
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    document.getElementById('score-box').style.display = '';
}

init()

export { camera, scene, light, renderer, buffer };
