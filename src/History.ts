import * as THREE from 'three';
import { scene, buffer } from './Root';
import { addScore } from './Score';
import { BOARD_SIZE, BoardSize, newHere } from './config';
import { showInfo } from './ui';
import { freeDrop } from './Physical';
import Block from './Block';
import { currentPtr } from './logic';

/**
 * To record blocks having been dropped to the board.
 */
export default class History {
    boardSize: BoardSize;
    prevBlock: Block;
    _dict: Array<Array<Array<THREE.Object3D>>>;
    object3d: THREE.Object3D;
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
        buffer.add(scene, this.object3d);
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
        buffer.remove(scene, this.object3d);
        this._init();
    }

    /**
     * remove the single block from the scene, and add it to the history.
     * @param {Block} block The block to be written into history.
     */
    write(block: Block) {
        buffer.remove(scene, block.object3d);
        let cubeMaterial = new THREE.MeshLambertMaterial({ color: block.color });
        let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        let borderMaterial = new THREE.LineBasicMaterial({color: 0xc0c0c0});
        let borderGeometry = new THREE.EdgesGeometry(boxGeometry, 1);
        for (let position of block.positions) {
            let [cubeX, cubeY, cubeZ] = block.getCubeMatrixIndex(position);
            let cubeWithBorder = new THREE.Group();
            let cube = new THREE.Mesh(
                boxGeometry,
                cubeMaterial
            );
            let border = new THREE.LineSegments(
                borderGeometry,
                borderMaterial
            );
            cube.position.set(cubeX + 0.5, cubeY + 0.5, cubeZ + 0.5);
            cube.castShadow = true;
            cube.receiveShadow = true;
            border.position.set(cubeX + 0.5, cubeY + 0.5, cubeZ + 0.5);
            cubeWithBorder.add(cube, border);
            this._dict[cubeY][cubeX][cubeZ] = cubeWithBorder;
            this.object3d.add(cubeWithBorder);
        }
    }

    /**
     * eliminate one row (column) in history.
     * @param {Number} layer Which layer.
     * @param {Number} index Which row (column).
     * @param {String} axis 'x' or 'z'.
     */
    eliminateRow(layer: number, index: number, axis: string = 'z', color: string, combo: number): void {
        if (axis === 'z') {
            for (let i = 0; i < this.boardSize.x; i++) {
                this.object3d.remove(this._dict[layer][i][index]);
            }
            for (let j = layer; j < this.boardSize.y; j++) {
                for (let i = 0; i < this.boardSize.x; i++) {
                    if (j + 1 < this.boardSize.y) {
                        this._dict[j][i][index] = this._dict[j + 1][i][index];
                        if (this._dict[j][i][index])
                            freeDrop(this._dict[j][i][index], 1);
                        else this._dict[j][i][index] = null;
                    }
                }
            }
        } else if (axis === 'x') {
            for (let k = 0; k < this.boardSize.z; k++) {
                this.object3d.remove(this._dict[layer][index][k]);
            }
            for (let j = layer; j < this.boardSize.y; j++) {
                for (let k = 0; k < this.boardSize.z; k++) {
                    if (j + 1 < this.boardSize.y) {
                        this._dict[j][index][k] = this._dict[j + 1][index][k];
                        if (this._dict[j][index][k])
                            freeDrop(this._dict[j][index][k], 1);
                        else this._dict[j][index][k] = null;
                    }
                }
            }
        }
        let delta = 100 * Math.pow(2, combo);
        showInfo('<p style="font-size: 60px; padding-top: 50px;">+' + delta + '</p>', color);
        addScore(delta);
    }

    /**
     * eliminate one whole layer in history.
     * @param {Number} layer Which layer.
     */
    eliminate(layer: number, combo: number): void {
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
                            freeDrop(this._dict[j][i][k], 1);
                    }
                    else this._dict[j][i][k] = null;
                }
            }
        }
        let delta = 300 * Math.pow(2, combo);
        showInfo('<p style="font-size: 80px; padding-top: 50px;">+' + delta + '</p>', '#cc3388');
        addScore(delta);
    }
}
