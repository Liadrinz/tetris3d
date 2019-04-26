import * as THREE from 'three';
import { scene } from './Root';

export default class History {
    constructor() {
        this.object3d = new THREE.Group();
        scene.add(this.object3d);
    }

    write(block) {
        scene.remove(block.object3d);
        for (let child of block.object3d.children) {
            let unitCube = child.clone();
            unitCube.position.x += block.object3d.position.x;
            unitCube.position.y += block.object3d.position.y;
            unitCube.position.z += block.object3d.position.z;
            this.object3d.add(unitCube);
        }
    }

    eliminate(layer) {
        let children = this.object3d.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].position.y === layer + 0.5) {
                children.splice(i, 1);
                i--;
            }
        }
        for (let child of children) {
            child.translateY(-1);
        }
    }
}
