import * as THREE from 'three';
import { scene } from './Root';
import { addScore } from './Score';
import { size } from './config';

export default class History {
    constructor() {
        this.size = size;
        this._init();
    }

    _init() {
        this._dict = new Array(this.size.y);
        for (let j = 0; j < this.size.y; j++) {
            let pane = [];
            for (let i = 0; i < this.size.x; i++) {
                let row = [];
                for (let k = 0; k < this.size.z; k++) {
                    row.push(null);
                }
                pane.push(row);
            }
            this._dict[j] = pane;
        }
        this.object3d = new THREE.Group();
        scene.add(this.object3d);
    }

    reset() {
        for (let j = 0; j < this.size.y; j++) {
            for (let i = 0; i < this.size.x; i++) {
                for (let k = 0; k < this.size.z; k++) {
                    if (this._dict[j][i][k])
                        this.object3d.remove(this._dict[j][i][k]);
                }
            }
        }
        scene.remove(this.object3d);
        this._init();
    }

    write(block) {
        scene.remove(block.object3d);
        for (let position of block.positions) {
            let cubeX = parseInt(block.object3d.position.x - block.center[0] + position[0] + 0.5);
            let cubeY = parseInt(block.object3d.position.y - block.center[1] + position[1] + 0.5);
            let cubeZ = parseInt(block.object3d.position.z - block.center[2] + position[2] + 0.5);
            let cubeWithBorder = new THREE.Group();
            let cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshLambertMaterial({ color: block.color })
            );
            let border = new THREE.EdgesHelper(cube, 0xc0c0c0);
            cube.position.set(cubeX + 0.5, cubeY + 0.5, cubeZ + 0.5);
            cube.castShadow = true;
            cube.receiveShadow = true;
            border.position.set(cubeX + 0.5, cubeY + 0.5, cubeZ + 0.5);
            cubeWithBorder.add(cube, border);
            this._dict[cubeY][cubeX][cubeZ] = cubeWithBorder;
            this.object3d.add(cubeWithBorder);
        }
    }

    eliminate(layer) {
        for (let i = 0; i < this.size.x; i++) {
            for (let k = 0; k < this.size.z; k++) {
                this.object3d.remove(this._dict[layer][i][k]);
            }
        }
        for (let j = layer; j < this.size.y; j++) {
            for (let i = 0; i < this.size.x; i++) {
                for (let k = 0; k < this.size.z; k++) {
                    if (j + 1 < this.size.y) {
                        this._dict[j][i][k] = this._dict[j + 1][i][k];
                        if (this._dict[j][i][k])
                            this._dict[j][i][k].translateY(-1);
                    }
                    else this._dict[j][i][k] = null;
                }
            }
        }
        addScore(64);
    }
}
