import * as THREE from 'three';
import { scene } from './Root';
import { currentBox, history, board, guideSteps } from './logic';
import { BOARD_SIZE, MAX_LAYERS, MAX_OPACITY, BLOCK_SPEED, newHere, setNewHere } from './config';
import { showInfo, hideMessage, hideDemo } from './ui';

const R = Math.PI / 2;

// only one Board instance in a game
export default class Board {
    constructor(history) {
        this.size = BOARD_SIZE;
        this.state = {
            fadeStop: false,
            showStop: false
        }
        this.leftMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let leftWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.z, this.size.y),
            this.leftMaterial
        );
        leftWall.translateX(-0.02);
        leftWall.translateY(parseInt(BOARD_SIZE.y / 2));
        leftWall.translateZ(parseInt(BOARD_SIZE.z / 2));
        leftWall.rotateY(R);
        this.rightMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let rightWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.z, this.size.y),
            this.rightMaterial
        );
        rightWall.translateX(BOARD_SIZE.x + 0.02);
        rightWall.translateY(parseInt(BOARD_SIZE.y / 2));
        rightWall.translateZ(parseInt(BOARD_SIZE.z / 2));
        rightWall.rotateY(R);
        this.frontMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let frontWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.x, this.size.y),
            this.frontMaterial
        );
        frontWall.translateX(parseInt(BOARD_SIZE.x / 2));
        frontWall.translateY(parseInt(BOARD_SIZE.y / 2));
        frontWall.translateZ(-0.02)
        this.backMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let backWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.x, this.size.y),
            this.backMaterial
        );
        backWall.translateX(parseInt(BOARD_SIZE.x / 2));
        backWall.translateY(parseInt(BOARD_SIZE.y / 2));
        backWall.translateZ(BOARD_SIZE.z + 0.02);
        scene.add(leftWall, rightWall, frontWall, backWall);
        this._init(history);
    }

    _init(history) {
        this.score = 0;
        this.history = history;
        this.object3d = new THREE.Group();
        var plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.x, this.size.z),
            new THREE.MeshPhongMaterial({ color: 0xa0a0a0 })
        );
        plane.rotation.x = - Math.PI / 2;
        plane.receiveShadow = true;
        plane.position.set(parseInt(this.size.x / 2), 0, parseInt(this.size.z / 2));
        this.object3d.add(plane);
        scene.add(this.object3d);
        this.matrix = [];
        this.colorMatrix = [];
        for (let j = 0; j < this.size.y; j++) {
            let pane = [];
            let colorPane = [];
            for (let i = 0; i < this.size.x; i++) {
                let subPane = [];
                let colorSubPane = [];
                for (let k = 0; k < this.size.z; k++) {
                    subPane.push(0);
                    colorSubPane.push(-1);
                }
                pane.push(subPane);
                colorPane.push(colorSubPane);
            }
            this.matrix.push(pane);
            this.colorMatrix.push(colorPane);
        }
    }

    overflowShow(direction) {
        showInfo('Stucked!', '#fff');
        this.state.showStop = false;
        this.state.fadeStop = true;
        if (direction === 'left') {
            if (this.leftMaterial.opacity >= MAX_OPACITY || this.state.showStop) return;
            let s = setInterval(() => {
                if (this.leftMaterial.opacity >= MAX_OPACITY || this.state.showStop)
                    clearInterval(s);
                this.leftMaterial.opacity += 0.1
            }, 20);
        } else if (direction === 'right') {
            if (this.rightMaterial.opacity >= MAX_OPACITY || this.state.showStop) return;
            let s = setInterval(() => {
                if (this.rightMaterial.opacity >= MAX_OPACITY || this.state.showStop)
                    clearInterval(s);
                this.rightMaterial.opacity += 0.1
            }, 20);
        } else if (direction === 'up') {
            if (this.frontMaterial.opacity >= MAX_OPACITY || this.state.showStop) return;
            let s = setInterval(() => {
                if (this.frontMaterial.opacity >= MAX_OPACITY || this.state.showStop)
                    clearInterval(s);
                this.frontMaterial.opacity += 0.1
            }, 20);
        } else if (direction === 'down') {
            if (this.backMaterial.opacity >= MAX_OPACITY || this.state.showStop) return;
            let s = setInterval(() => {
                if (this.backMaterial.opacity >= MAX_OPACITY || this.state.showStop)
                    clearInterval(s);
                this.backMaterial.opacity += 0.1
            }, 20);
        }
    }

    overflowFade(direction) {
        let s;
        this.state.fadeStop = false;
        this.state.showStop = true;
        if (direction === 'left') {
            if (this.leftMaterial.opacity <= 0 || this.state.fadeStop) return;
            let s = setInterval(() => {
                if (this.leftMaterial.opacity <= 0 || this.state.fadeStop)
                    clearInterval(s);
                this.leftMaterial.opacity -= 0.1
            }, 20);
        } else if (direction === 'right') {
            if (this.rightMaterial.opacity <= 0 || this.state.fadeStop) return;
            let s = setInterval(() => {
                if (this.rightMaterial.opacity <= 0 || this.state.fadeStop)
                    clearInterval(s);
                this.rightMaterial.opacity -= 0.1
            }, 20);
        } else if (direction === 'up') {
            if (this.frontMaterial.opacity <= 0 || this.state.fadeStop) return;
            let s = setInterval(() => {
                if (this.frontMaterial.opacity <= 0 || this.state.fadeStop)
                    clearInterval(s);
                this.frontMaterial.opacity -= 0.1
            }, 20);
        } else if (direction === 'down') {
            if (this.backMaterial.opacity <= 0 || this.state.fadeStop) return;
            let s = setInterval(() => {
                if (this.backMaterial.opacity <= 0 || this.state.fadeStop)
                    clearInterval(s);
                this.backMaterial.opacity -= 0.1
            }, 20);
        }
    }

    reset(history) {
        scene.remove(this.object3d);
        this._init(history);
    }

    eliminateCheck() {
        let rowsToEliminate = [];

        for (let j = 0; j < this.size.y; j++) {
            for (let i = 0; i < this.size.x; i++) {
                let equals = true, prev = this.colorMatrix[j][i][0];
                for (let k = 1; k < this.size.z; k++) {
                    if (this.colorMatrix[j][i][k] !== prev || this.colorMatrix[j][i][k] === -1) {
                        equals = false;
                        break;
                    } else {
                        prev = this.colorMatrix[j][i][k];
                    }
                }
                if (equals) {
                    rowsToEliminate.push([j, i, 'x']);
                }
            }
        }

        for (let j = 0; j < this.size.y; j++) {
            for (let k = 0;  k < this.size.z; k++) {
                let equals = true, prev = this.colorMatrix[j][0][k];
                for (let i = 1; i < this.size.x; i++) {
                    if (this.colorMatrix[j][i][k] !== prev || this.colorMatrix[j][i][k] === -1) {
                        equals = false;
                        break;
                    } else {
                        prev = this.colorMatrix[j][i][k];
                    }
                }
                if (equals) {
                    rowsToEliminate.push([j, k, 'z']);
                }
            }
        }

        for (let args of rowsToEliminate) {
            if (newHere) {
                guideSteps[3] += 1;
                if (guideSteps[3] === 1) {
                    hideMessage(() => {});
                    showInfo('<h1 style="color: #fff">Have fun! Bye!</h1>', 0xfff)
                    setNewHere(false);
                    hideDemo();
                    localStorage.setItem('new-comer', false);
                }
            }
            let [layer, index, axis] = args;
            this.history.eliminateRow(layer, index, axis);
            if (axis === 'x') {
                for (let k = 0; k < this.size.z; k++) {
                    for (let j = layer; j < this.size.y; j++) {
                        if (j + 1 < this.size.y) {
                            this.matrix[j][index][k] = this.matrix[j + 1][index][k];
                            this.colorMatrix[j][index][k] = this.colorMatrix[j + 1][index][k];
                        } else {
                            this.matrix[j][index][k] = 0;
                            this.colorMatrix[j][index][k] = -1;
                        }
                    }
                }
            } else if (axis === 'z') {
                for (let i = 0; i < this.size.x; i++) {
                    for (let j = layer; j < this.size.y; j++) {
                        if (j + 1 < this.size.y) {
                            this.matrix[j][i][index] = this.matrix[j + 1][i][index];
                            this.colorMatrix[j][i][index] = this.colorMatrix[j + 1][i][index];
                        } else {
                            this.matrix[j][i][index] = 0;
                            this.colorMatrix[j][i][index] = -1;
                        }
                    }
                }
            }
        }

        for (let j = 0; j < this.size.y; j++) {
            let eliminatable = true;
            for (let i = 0; i < this.size.x && eliminatable; i++) {
                for (let k = 0; k < this.size.z && eliminatable; k++) {
                    if (this.matrix[j][i][k] === 0) {
                        eliminatable = false;
                    }
                }
            }
            if (eliminatable) {
                if (newHere) {
                    guideSteps[3] += 1;
                    if (guideSteps[3] === 1) {
                        hideMessage(() => {});
                        showInfo('<h1 style="color: #fff">Have fun! Bye!</h1>', 0xfff)
                    }
                }
                this.history.eliminate(j);
                this.matrix.splice(j, 1);
                this.colorMatrix.splice(j, 1);
                j--;
                let pane = [];
                let colorPane = [];
                for (let i = 0; i < this.size.x; i++) {
                    let subPane = [];
                    let colorSubPane = [];
                    for (let k = 0; k < this.size.z; k++) {
                        subPane.push(0);
                        colorSubPane.push(-1);
                    }
                    pane.push(subPane);
                    colorPane.push(colorSubPane);
                }
                this.matrix.push(pane);
                this.colorMatrix.push(colorPane);
            }
        }
    }

    dieCheck() {
        for (let j = MAX_LAYERS - 1; j < this.size.y; j++) {
            for (let i = 0; i < this.size.x; i++) {
                for (let k = 0; k < this.size.z; k++) {
                    if (this.matrix[j][i][k] === 1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    restart() {
        scene.remove(currentBox[0].object3d);
        history.reset();
        board.reset(history);
        currentBox[0].state.speed = BLOCK_SPEED;
    }
}
