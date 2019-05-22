import * as THREE from 'three';
import { scene } from './Root';
import { board } from './logic';
import { addScore } from './Score';
import { BOARD_SIZE, BLOCK_SPEED, INIT_BLOCK_Y } from './config';
import { showInfo } from './ui';

export default class Block {
    /**
     * 
     * @param {Array} positions Array 2D, showing which positions have a block.
     * @param {Array} center The rotation center of the whole block.
     * @param {Number} color hex rgb.
     */
    constructor(positions, center, color) {
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
        this.object3d.position.set(...center);

        // building block
        for (let position of positions) {
            let [x, y, z] = position;
            let cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshLambertMaterial({ color: color })
            );
            cube.position.set(x - center[0] + .5, y - center[1] + .5, z - center[2] + .5);
            cube.castShadow = true;
            cube.receiveShadow = true;
            let border = new THREE.EdgesHelper(cube, 0xc0c0c0);
            border.position.set(x - center[0] + .5, y - center[1] + .5, z - center[2] + .5);
            this.object3d.add(cube);
            this.object3d.add(border);
        }

        this.object3d.position.y = INIT_BLOCK_Y;
    }

    getCubeMatrixIndex(position) {
        let cubeX = parseInt(this.object3d.position.x - this.center[0] + position[0] + 0.5);
        let cubeY = parseInt(this.object3d.position.y - this.center[1] + position[1] + 0.5);
        let cubeZ = parseInt(this.object3d.position.z - this.center[2] + position[2] + 0.5);
        return [cubeX, cubeY, cubeZ];
    }

    // if there is collision when moving on x and z
    _collisionXZ(direction) {
        for (let position of this.positions) {
            let [cubeX, cubeY, cubeZ] = this.getCubeMatrixIndex(position);
            if (direction === 'left') {
                if (cubeX <= 0) {
                    board.overflowShow('left');
                    return true;
                }
                if (board.matrix[cubeY][cubeX - 1][cubeZ])
                    return true;
            } else if (direction === 'up') {
                if (cubeZ <= 0) {
                    board.overflowShow('up');
                    return true;
                }
                if (board.matrix[cubeY][cubeX][cubeZ - 1])
                    return true;
            } else if (direction === 'right') {
                if (cubeX >= this.boardSize.x - 1) {
                    board.overflowShow('right')
                    return true;
                }
                if (board.matrix[cubeY][cubeX + 1][cubeZ])
                    return true;
            } else if (direction === 'down') {
                if (cubeZ >= this.boardSize.z - 1) {
                    board.overflowShow('down');
                    return true;
                }
                if (board.matrix[cubeY][cubeX][cubeZ + 1])
                    return true;
            }
        }
        return false;
    }

    // if there is collision on y
    _collisionY() {
        for (let position of this.positions) {
            let [cubeX, cubeY, cubeZ] = this.getCubeMatrixIndex(position);
            if (cubeY === 0 || board.matrix[cubeY - 1][cubeX][cubeZ]) {
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
                    showInfo('+' + parseInt(this.positions.length * Math.pow(this.state.originalSpeed / BLOCK_SPEED, 2)), '#fff');
                    addScore(parseInt(this.positions.length * Math.pow(this.state.originalSpeed / BLOCK_SPEED, 2)));
                    // update the info of the board
                    for (let position of this.positions) {
                        let [cubeX, cubeY, cubeZ] = this.getCubeMatrixIndex(position);
                        board.matrix[cubeY][cubeX][cubeZ] = 1;
                        board.colorMatrix[cubeY][cubeX][cubeZ] = this.color;
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
