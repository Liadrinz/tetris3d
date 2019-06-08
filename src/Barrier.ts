import * as THREE from 'three';
import History from './History';
import { BoardSize, BOARD_SIZE } from './config';

export default class Barrier {
    size: BoardSize
    layer: number;
    holes: Array<Array<number>>;
    matrix: Array<Array<number>>;
    object3d: THREE.Object3D;
    history: History;
    
    constructor(history: History, layer: number, holes: Array<Array<number>>, reverse = false) {
        this.size = BOARD_SIZE;
        this._init(history, layer, holes, reverse);
    }

    _init(history: History, layer: number, holes: Array<Array<number>>, reverse = false): void {
        this.history = history;
        this.layer = layer;
        this.holes = holes;
        this.matrix = [];
        for (let i = 0; i < this.size.x; i++) {
            let subPane = [];
            for (let j = 0; j < this.size.z; j++) {
                if (reverse) {
                    subPane.push(0);
                } else {
                    subPane.push(1);
                }
            }
            this.matrix.push(subPane);
        }
        for (let hole of this.holes) {
            if (reverse) {
                this.matrix[hole[0]][hole[1]] = 1;
            } else {
                this.matrix[hole[0]][hole[1]] = 0;
            }
        }

        this.object3d = new THREE.Group();

        for (let i = 0; i < this.size.x; i++) {
            for (let j = 0; j < this.size.z; j++) {
                if (this.matrix[i][j] == 1) {
                    let piece = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 1, 1),
                        new THREE.MeshPhongMaterial({ color: 0xa0a0ff })
                    );
                    piece.receiveShadow = true;
                    piece.castShadow = true;
                    piece.rotation.x = - Math.PI / 2;
                    piece.receiveShadow = true;
                    piece.position.set(i + 0.5, this.layer - 0.5, j + 0.5);
                    this.object3d.add(piece);
                }
            }
        }
    }
}