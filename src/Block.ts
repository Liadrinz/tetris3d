import * as THREE from 'three';
import { scene } from './Root';
import { currentLevel } from './logic';
import { addScore } from './Score';
import { BOARD_SIZE, BLOCK_SPEED, INIT_BLOCK_Y, BoardSize } from './config';
import { showInfo } from './ui';

export interface BlockState {
    originalSpeed: number,  // the normal speed of this block
    speed: number,  // current speed of this block
    shown: boolean,
    readyToSettle: boolean,
    settled: boolean,
    allowRotate: boolean,
    paused: boolean
}

export default class Block {
    boardSize: BoardSize;
    positions: Array<Array<number>>;
    center: Array<number>;
    color: number;
    state: BlockState;
    _cachedY: number;
    object3d: THREE.Object3D;
    constructor(positions: Array<Array<number>>, center: Array<number>, color: number) {
        this.boardSize = BOARD_SIZE;
        this.positions = positions;
        this.center = center;
        this.color = color;
        this.state = {
            originalSpeed: BLOCK_SPEED,  // the normal speed of this block
            speed: BLOCK_SPEED,  // current speed of this block
            shown: false,
            readyToSettle: false,
            settled: false,
            allowRotate: true,
            paused: false
        }
        this._cachedY = 0;
        this.object3d = new THREE.Group();
        let [x, y, z] = center;
        this.object3d.position.set(x, y, z);

        // building block
        for (let position of positions) {
            let [x, y, z] = position;
            let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
            let cube = new THREE.Mesh(
                boxGeometry,
                new THREE.MeshLambertMaterial({ color: color })
            );
            cube.position.set(x - center[0] + .5, y - center[1] + .5, z - center[2] + .5);
            cube.castShadow = true;
            cube.receiveShadow = true;
            let borderGeometry = new THREE.EdgesGeometry(boxGeometry, 1);
            let border = new THREE.LineSegments(
                borderGeometry,
                new THREE.LineBasicMaterial({color: 0xc0c0c0})
            );
            border.position.set(x - center[0] + .5, y - center[1] + .5, z - center[2] + .5);
            this.object3d.add(cube);
            this.object3d.add(border);
        }

        this.object3d.position.y = INIT_BLOCK_Y;
    }

    getCubeMatrixIndex(position: Array<number>) {
        let cubeX = parseInt((this.object3d.position.x - this.center[0] + position[0] + 0.5).toString());
        let cubeY = parseInt((this.object3d.position.y - this.center[1] + position[1] + 0.5).toString());
        let cubeZ = parseInt((this.object3d.position.z - this.center[2] + position[2] + 0.5).toString());
        return [cubeX, cubeY, cubeZ];
    }

    // if there is collision when moving on x and z
    _collisionXZ(direction: string) {
        for (let position of this.positions) {
            let [cubeX, cubeY, cubeZ] = this.getCubeMatrixIndex(position);
            if (direction === 'left') {
                if (cubeX <= 0) {
                    currentLevel.board.overflowShow('left');
                    return true;
                }
                if (currentLevel.board.matrix[cubeY][cubeX - 1][cubeZ] || currentLevel.board.barrierMatrix[cubeY + 1][cubeX - 1][cubeZ])
                    return true;
            } else if (direction === 'up') {
                if (cubeZ <= 0) {
                    currentLevel.board.overflowShow('up');
                    return true;
                }
                if (currentLevel.board.matrix[cubeY][cubeX][cubeZ - 1] || currentLevel.board.barrierMatrix[cubeY + 1][cubeX][cubeZ - 1])
                    return true;
            } else if (direction === 'right') {
                if (cubeX >= this.boardSize.x - 1) {
                    currentLevel.board.overflowShow('right')
                    return true;
                }
                if (currentLevel.board.matrix[cubeY][cubeX + 1][cubeZ] || currentLevel.board.barrierMatrix[cubeY + 1][cubeX + 1][cubeZ])
                    return true;
            } else if (direction === 'down') {
                if (cubeZ >= this.boardSize.z - 1) {
                    currentLevel.board.overflowShow('down');
                    return true;
                }
                if (currentLevel.board.matrix[cubeY][cubeX][cubeZ + 1] || currentLevel.board.barrierMatrix[cubeY + 1][cubeX][cubeZ + 1])
                    return true;
            }
        }
        return false;
    }

    // if there is collision on y
    _collisionY() {
        for (let position of this.positions) {
            let [cubeX, cubeY, cubeZ] = this.getCubeMatrixIndex(position);
            if (cubeY === 0 || currentLevel.board.matrix[cubeY - 1][cubeX][cubeZ] || currentLevel.board.barrierMatrix[cubeY][cubeX][cubeZ]) {
                return true;
            }
        }
        return false;
    }

    // called each frame, updating the state of the block
    update() {
        if (this.state.paused) {
            this.state.settled = false;
            return;
        }
        if (!this.state.shown) {
            scene.add(this.object3d);
            this.state.shown = true;
        }
        if (!this.state.settled) {
            this._cachedY += this.state.speed;
            if (this._cachedY >= 1) {
                if (this.state.readyToSettle && this._collisionY()) {
                    this.state.settled = true;
                    this.state.readyToSettle = false;
                    showInfo('+' + parseInt((this.positions.length * Math.pow(this.state.originalSpeed / BLOCK_SPEED, 2)).toString()), '#fff');
                    addScore(parseInt((this.positions.length * Math.pow(this.state.originalSpeed / BLOCK_SPEED, 2)).toString()));
                    // update the info of the level1.board
                    for (let position of this.positions) {
                        let [cubeX, cubeY, cubeZ] = this.getCubeMatrixIndex(position);
                        currentLevel.board.matrix[cubeY][cubeX][cubeZ] = 1;
                        currentLevel.board.colorMatrix[cubeY][cubeX][cubeZ] = this.color;
                    }
                } else {
                    this.state.allowRotate = false;
                    if (this._collisionY()) {
                        this.state.readyToSettle = true;
                    } else {
                        this.object3d.translateY(-1);
                        this._cachedY = 0;
                        if (this._collisionY()) {
                            this.state.readyToSettle = true;
                        }
                    }
                    this.state.allowRotate = true;
                }
            }
        } else {
            if (!this._collisionY()) {
                this.state.settled = false;
            } else {
                this.state.speed = this.state.originalSpeed;
            }
        }
    }
}