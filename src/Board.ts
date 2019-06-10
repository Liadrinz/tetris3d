import * as THREE from 'three';
import { scene, buffer } from './Root';
import { BOARD_SIZE, MAX_LAYERS, MAX_OPACITY, newHere, setNewHere, BoardSize } from './config';
import { showInfo, hideMessage, hideDemo } from './ui';
import History from './History';
import Barrier from './Barrier';
import { currentPtr, guideSteps } from './logic';
import { hex } from './Physical';

const R = Math.PI / 2;

export interface BoardState {
    fadeStop: boolean,
    showStop: boolean
}

// only one Board instance in a game
export default class Board {
    size: BoardSize = BOARD_SIZE;
    state: BoardState = {
        fadeStop: false,
        showStop: false
    };
    leftMaterial: THREE.MeshPhongMaterial;
    rightMaterial: THREE.MeshPhongMaterial;
    frontMaterial: THREE.MeshPhongMaterial;
    backMaterial: THREE.MeshPhongMaterial;
    score: number = 0;
    history: History;
    barriers: Array<Barrier>;
    object3d: THREE.Object3D;
    barrierObjects: Array<THREE.Object3D> = [];
    matrix: Array<Array<Array<number>>> = [];
    colorMatrix: Array<Array<Array<number>>> = [];
    barrierMatrix: Array<Array<Array<number>>> = [];
    combo: number = 0;

    constructor(history: History, barriers: Array<Barrier> = null) {
        // build walls
        this.leftMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let leftWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.z, this.size.y),
            this.leftMaterial
        );
        leftWall.translateX(-0.02);
        leftWall.translateY(parseInt((BOARD_SIZE.y / 2).toString()));
        leftWall.translateZ(parseInt((BOARD_SIZE.z / 2).toString()));
        leftWall.rotateY(R);
        this.rightMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let rightWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.z, this.size.y),
            this.rightMaterial
        );
        rightWall.translateX(BOARD_SIZE.x + 0.02);
        rightWall.translateY(parseInt((BOARD_SIZE.y / 2).toString()));
        rightWall.translateZ(parseInt((BOARD_SIZE.z / 2).toString()));
        rightWall.rotateY(R);
        this.frontMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let frontWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.x, this.size.y),
            this.frontMaterial
        );
        frontWall.translateX(parseInt((BOARD_SIZE.x / 2).toString()));
        frontWall.translateY(parseInt((BOARD_SIZE.y / 2).toString()));
        frontWall.translateZ(-0.02)
        this.backMaterial = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, opacity: 0.0, transparent: true });
        let backWall = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size.x, this.size.y),
            this.backMaterial
        );
        backWall.translateX(parseInt((BOARD_SIZE.x / 2).toString()));
        backWall.translateY(parseInt((BOARD_SIZE.y / 2).toString()));
        backWall.translateZ(BOARD_SIZE.z + 0.02);
        buffer.add(scene, leftWall, rightWall, frontWall, backWall);

        if (barriers !== null)
            this.barriers = barriers;
        else this.barriers = [];

        this.barrierMatrix = [];  // 0-1 matrix, showing which positions have a barrier
        for (let barrier of this.barriers) {
            this.barrierMatrix.push(barrier.matrix);
        }
        
        this._init(history);
    }

    _init(history: History): void {
        this.score = 0;
        this.history = history;
        this.object3d = new THREE.Group();
        
        // the board receiving blocks
        var plane = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 15, this.size.z),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );

        plane.receiveShadow = true;
        plane.position.set(parseInt((this.size.x / 2).toString()), -7.5, parseInt((this.size.z / 2).toString()));
        buffer.add(this.object3d, plane);
        buffer.add(scene, this.object3d);
        
        // initialize some matrixes
        this.matrix = [];  // 0-1 matrix, showing which positions have a block
        this.colorMatrix = [];  // Number matrix, showing the color of each position. -1 if no block in this position.
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

    setBarriers(barriers: Array<Barrier>): void {
        for (let barObj of this.barrierObjects) {
            scene.remove(barObj);
        }
        this.barriers = barriers;
        this.barrierMatrix = []
        let barPtr = 0;
        for (let j = 0; j < this.size.y; j++) {
            if (barPtr < barriers.length && j == barriers[barPtr].layer) {
                this.barrierMatrix.push(barriers[barPtr].matrix);
                this.barrierObjects.push(barriers[barPtr].object3d);
                buffer.add(scene, barriers[barPtr].object3d);
                barPtr++;
            } else {
                let subMatrix: Array<Array<number>> = [];
                for (let i = 0; i < this.size.x; i++) {
                    let vector: Array<number> = [];
                    for (let k = 0; k < this.size.z; k++) {
                        vector.push(0);
                    }
                    subMatrix.push(vector);
                }
                this.barrierMatrix.push(subMatrix);
            }
        }
        for (let barrier of this.barriers) {
            this.barrierMatrix.push(barrier.matrix);
        }
    }

    // show walls when overflow
    overflowShow(direction: string): void {
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

    overflowFade(direction: string): void {
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

    reset(history: History): void {
        scene.remove(this.object3d);
        this._init(history);
    }

    eliminateCheck(): void {
        let comboed = false;

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
                comboed = true;
                if (newHere) {
                    guideSteps[3] += 1;
                    if (guideSteps[3] === 1) {
                        hideMessage(() => {});
                        showInfo('<h1 style="color: #fff">新手教程完成！</h1>', 0xfff)
                    }
                }
                this.history.eliminate(j, this.combo);
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

        let rowsToEliminate: Array<Array<string|number>> = [];
        // collect rows to be eliminated on axis z
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
                    rowsToEliminate.push([j.toString(), i.toString(), 'x', this.colorMatrix[j][i][0]]);
                }
            }
        }

        // collect rows to be eliminated on axis x
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
                    rowsToEliminate.push([j.toString(), k.toString(), 'z', this.colorMatrix[j][0][k]]);
                    comboed = true;
                }
            }
        }

        // eliminate rows collected
        for (let args of rowsToEliminate) {
            // the player is a new comer
            if (newHere) {
                guideSteps[3] += 1;
                if (guideSteps[3] === 1) {
                    hideMessage(() => {});
                    showInfo('<h1 style="color: #fff">新手教程完成！</h1>', 0xfff)
                    setNewHere(false);
                    hideDemo();
                    localStorage.setItem('new-comer', 'false');
                }
            }
            let [layer, index, axis, color] = args;
            color = parseInt(color.toString());
            layer = parseInt(layer.toString());
            index = parseInt(index.toString());
            axis = axis.toString();
            this.history.eliminateRow(layer, index, axis, '#' + hex(color), this.combo);
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

        if (comboed) {
            ++this.combo;
        } else {
            this.combo = 0;
        }
    }

    dieCheck(): boolean {
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

    restart(): void {
        scene.remove(currentPtr[0].current[0].object3d);
        currentPtr[0].history.reset();
        currentPtr[0].board.reset(currentPtr[0].history);
        currentPtr[0].current[0].state.speed = currentPtr[0].levelInfo.initSpeed;
    }
}
