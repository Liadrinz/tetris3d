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
            console.log(child.position.x, child.position.y, child.position.z);
            let unitCube = child.clone();
            unitCube.position.x += block.object3d.position.x;
            unitCube.position.y += block.object3d.position.y;
            unitCube.position.z += block.object3d.position.z;
            // normalize the position
            let tempCube = new THREE.Group();
            tempCube.position.x = block.object3d.position.x + (block.positions[parseInt(block.object3d.children.indexOf(child)/2)][0] - block.center[0]);
            tempCube.position.y = block.object3d.position.y + (block.positions[parseInt(block.object3d.children.indexOf(child)/2)][1] - block.center[1]);
            tempCube.position.z = block.object3d.position.z + (block.positions[parseInt(block.object3d.children.indexOf(child)/2)][2] - block.center[2]);
            let unitCubeClone = unitCube.clone();
            unitCubeClone.position.x -= tempCube.position.x;
            unitCubeClone.position.y -= tempCube.position.y;
            unitCubeClone.position.z -= tempCube.position.z;
            tempCube.add(unitCubeClone);
            this.object3d.add(tempCube);
        }
    }

    eliminate(layer) {
        let children = this.object3d.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].position.y === layer) {
                children.splice(i, 1);
                i--;
            }
        }
        for (let child of children) {
            child.translateY(-1);
        }
    }
}
