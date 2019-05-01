import * as THREE from 'three';
import { scene } from './Root';
import { currentBox, history, board } from './logic';
import { BOARD_SIZE } from './config';

export default class Board {
    constructor(history) {
        this.size = BOARD_SIZE;
        this._init(history);
    }

    _init(history) {
        this.history = history;
        this.object3d = new THREE.Group();
        var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.size.x, this.size.z), new THREE.MeshPhongMaterial({ color: 0xa0a0a0 }));
        plane.rotation.x = - Math.PI / 2;
        plane.receiveShadow = true;
        plane.position.set(parseInt(this.size.x/2), 0, parseInt(this.size.z/2));
        this.object3d.add(plane);
        scene.add(this.object3d);
        this.matrix = [];
        for (let j = 0; j < this.size.y; j++) {
            let pane = [];
            for (let i = 0; i < this.size.x; i++) {
                let subPane = [];
                for (let k = 0; k < this.size.z; k++) {
                    subPane.push(0);
                }
                pane.push(subPane);
            }
            this.matrix.push(pane);
        }
    }

    reset(history) {
        scene.remove(this.object3d);
        this._init(history);
    }

    eliminateCheck() {
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
                this.history.eliminate(j);
                this.matrix.splice(j, 1);
                j--;
                let pane = [];
                for (let i = 0; i < this.size.x; i++) {
                    let subPane = [];
                    for (let k = 0; k < this.size.z; k++) {
                        subPane.push(0);
                    }
                    pane.push(subPane);
                }
                this.matrix.push(pane);
            }
        }
    }

    dieCheck() {
        for (let j = 7; j < this.size.y; j++) {
            for (let i = 0; i < this.size.x; i++) {
                for (let k = 0; k < this.size.z; k++) {
                    if (this.matrix[j][i][k] === 1) {
                        alert('Click to Restart!');
                        scene.remove(currentBox[0]);
                        history.reset();
                        board.reset(history);
                    }
                }
            }
        }
    }
}
