import * as THREE from 'three';
import { scene } from './Root';
import { addScore } from './Score';
import { BOARD_SIZE, BLOCK_SPEED } from './config';
import { currentBox } from './logic';
import { showInfo } from './ui';

export default class History {
    constructor() {
        this.boardSize = BOARD_SIZE;
        this._init();
        this.prevBlock = null;
    }

    _init() {
        this._dict = new Array(this.boardSize.y);
        for (let j = 0; j < this.boardSize.y; j++) {
            let pane = [];
            for (let i = 0; i < this.boardSize.x; i++) {
                let row = [];
                for (let k = 0; k < this.boardSize.z; k++) {
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
        for (let j = 0; j < this.boardSize.y; j++) {
            for (let i = 0; i < this.boardSize.x; i++) {
                for (let k = 0; k < this.boardSize.z; k++) {
                    if (this._dict[j][i][k])
                        this.object3d.remove(this._dict[j][i][k]);
                }
            }
        }
        scene.remove(this.object3d);
        this._init();
    }

    write(block) {
        this.prevBlock = block;
        scene.remove(block.object3d);
        for (let position of block.positions) {
            let [cubeX, cubeY, cubeZ] = block.getCubeMatrixIndex(position);
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
        for (let i = 0; i < this.boardSize.x; i++) {
            for (let k = 0; k < this.boardSize.z; k++) {
                this.object3d.remove(this._dict[layer][i][k]);
            }
        }
        for (let j = layer; j < this.boardSize.y; j++) {
            for (let i = 0; i < this.boardSize.x; i++) {
                for (let k = 0; k < this.boardSize.z; k++) {
                    if (j + 1 < this.boardSize.y) {
                        this._dict[j][i][k] = this._dict[j + 1][i][k];
                        if (this._dict[j][i][k])
                            this._dict[j][i][k].translateY(-1);
                    }
                    else this._dict[j][i][k] = null;
                }
            }
        }
        showInfo('<p style="font-size: 40px; padding-top: 50px;">+' + parseInt(100 * Math.pow(this.prevBlock.state.originalSpeed / BLOCK_SPEED, 2)) + '</p>', '#cc3388');
        addScore(parseInt(100 * Math.pow(this.prevBlock.state.originalSpeed / BLOCK_SPEED, 2)));
    }
}
