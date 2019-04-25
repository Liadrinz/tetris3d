import * as THREE from 'three';
import { scene } from './Root';

export default class Board {
    constructor() {
        this.object3d = new THREE.Group();
        var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(8, 8), new THREE.MeshPhongMaterial({ color: 0xa0a0a0}));
        plane.rotation.x = - Math.PI / 2;
        plane.receiveShadow = true;
        plane.position.set(4, 0, 4);
        this.object3d.add(plane);
        scene.add(this.object3d);
        this.matrix = [];
        for (let i = 0; i < 8; i++) {
            let pane = [];
            for (let j = 0; j < 16; j++) {
                pane.push([0, 0, 0, 0, 0, 0, 0, 0]);
            }
            this.matrix.push(pane);
        }
    }
}
