import * as THREE from 'three';

class Ground {
    constructor (width, height, color) {
        this.object = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), new THREE.MeshPhongMaterial({ color: color, depthWrite: false }));
        this.object.rotation.x = - Math.PI / 2;
        this.object.receiveShadow = true;
    }
};

export default Ground;
